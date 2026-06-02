import {
  CalendarDate,
  getLocalTimeZone,
  today,
  type DateValue,
} from "@internationalized/date";

/**
 * Formats a date (Date object or ISO string) into a readable string.
 *
 * @param input - A Date object or a date string (e.g. "1987-07-12T00:00:00.000Z").
 * @param options - Optional settings.
 * @param options.format - Format style:
 *   - `'long'` (default): e.g. "July 12, 1987"
 *   - `'short'`: e.g. "Jul 12, 1987"
 *   - `'numeric'`: e.g. "07/12/1987"
 *
 * @defaultReturn Current date if no input is provided.
 * @returns A formatted date string.
 */
export function formatDate(
  input: Date | string = new Date(),
  format?: "long" | "short" | "numeric"
): string {
  const date = typeof input === "string" ? new Date(input) : input;

  if (isNaN(date.getTime())) return "Invalid Date";

  format = format ?? "short";

  const formatOptions: Intl.DateTimeFormatOptions =
    format === "numeric"
      ? { month: "2-digit", day: "2-digit", year: "numeric" }
      : format === "short"
        ? { month: "short", day: "numeric", year: "numeric" }
        : { month: "long", day: "numeric", year: "numeric" };

  return new Intl.DateTimeFormat("en-US", formatOptions).format(date);
}

/**
 * Converts a 24-hour time string into Philippine 12-hour format (AM/PM).
 *
 * @param time - Time string in "HH:mm" or "HH:mm:ss" format
 * @param includeSeconds - Whether to include seconds in the output (default: false)
 * @returns Formatted time string in 12-hour format (e.g., "08:16 AM" or "08:16:38 AM")
 *
 * @example
 * formatTime("08:16:38")
 * // "08:16 AM"
 *
 * @example
 * formatTime("13:05", true)
 * // "01:05:00 PM"
 */
export function formatTime(
  time: string,
  includeSeconds: boolean = false
): string {
  const [rawHours, rawMinutes, rawSeconds] = time.split(':');

  const hours = Number(rawHours);
  const minutes = Number(rawMinutes);
  const seconds = Number(rawSeconds ?? 0);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    (includeSeconds && Number.isNaN(seconds))
  ) {
    throw new Error('Invalid time string format');
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const normalizedHours = hours % 12 || 12;

  const hh = String(normalizedHours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  return includeSeconds
    ? `${hh}:${mm}:${ss} ${period}`
    : `${hh}:${mm} ${period}`;
}


/** Date helper for `@internationalized/date` */
export class IntlDateHelper {

  /** reuse timezone */
  private static readonly tz = getLocalTimeZone();

  /** Returns today's date (CalendarDate) */
  static get today(): DateValue {
    return today(this.tz);
  }

  /** Returns the latest birthdate allowed for an 18-year-old */
  static get minimumBirthDate(): DateValue {

    return today(this.tz)
      .subtract({ years: 18 });
  }

  /** Returns tomorrow’s date */
  static get tomorrow(): DateValue {

    return today(this.tz)
      .add({ days: 1 });
  }

  /** Returns yesterday’s date */
  static get yesterday(): DateValue {

    return today(this.tz)
      .subtract({ days: 1 });
  }

  /** Converts ISO string -> CalendarDate */
  static toDateValue(date: string): DateValue {

    const [year, month, day] =
      NativeDateHelper.parseDateParts(date);

    return new CalendarDate(
      year,
      month,
      day
    );
  }
  /** Converts ISO string -> CalendarDate */
  static toDateValues(dates: string[]): DateValue[] {
    return dates.map(date => this.toDateValue(date))
  }
}

/** Date helper for Native JS Date / ISO dates */
export class NativeDateHelper {

  /** Asia/Manila formatter (reuse instance) */
  private static readonly manilaFormatter =
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

  /** Returns date like `1994-05-23` */
  static get isoToday(): string {
    return new Date().toISOString().split("T")[0];
  }

  static today(date: Date = new Date()): Date {
    // format → YYYY-MM-DD (en-CA gives ISO style)
    const formatted = this.manilaFormatter.format(date);

    // create Date object (midnight Manila date)
    return new Date(`${formatted}T00:00:00+08:00`);
  }

  static get currentMonth() {
    return NativeDateHelper.today().getMonth()
  }

  /** Returns date like `YYYY-MM-DD HH:MM:SS` */
  static get currentTimestamp(): string {
    return new Date()
      .toISOString()
      .replace("T", " ")
      .split(".")[0];
  }


  static get currentYear() {
    return new Date().getFullYear().toString();
  }

  /** Parses a date string and returns `[year, month, day]`
   * based on Asia/Manila timezone.
   */
  static parseDateParts(date: string): [number, number, number] {

    const d = new Date(date);

    const [y, m, dd] = this.manilaFormatter
      .format(d)
      .split("-")
      .map(Number);

    return [y, m, dd];
  }

  /** Checks if date already passed */
  static isDateEnded(isoDate: string): boolean {

    const now = new Date();
    const targetDate = new Date(isoDate);

    return targetDate < now;
  }

  /** @returns "past" | "today" | "future" */
  static dateStatus(
    isoDate: string
  ): "past" | "today" | "future" {

    const now = new Date();
    const target = new Date(isoDate);

    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const targetDay = new Date(
      target.getFullYear(),
      target.getMonth(),
      target.getDate()
    );

    if (targetDay < today) return "past";
    if (targetDay.getTime() === today.getTime()) return "today";

    return "future";
  }


  static pHTimestamp(): string {
    const now = new Date();

    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(now);

    const get = (type: string) =>
      parts.find((p) => p.type === type)?.value ?? "";

    return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
  }
}


export function formatPHTime(date: Date | string | number = new Date()): string {
  const d = new Date(date);

  return new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}