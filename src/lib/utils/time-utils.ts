
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
/** Lunch break window that is excluded from the hour count when requested. */
const LUNCH_BREAK_START_MINUTES = 12 * 60; // 12:00 PM
const LUNCH_BREAK_END_MINUTES = 13 * 60; // 1:00 PM

/**
 * Calculates the number of hours between two time strings.
 *
 * Accepts times in either `HH:mm` or `HH:mm:ss` format (24-hour clock).
 * If `endTime` is earlier than `startTime`, it is assumed to fall on the
 * next day (i.e. the range wraps past midnight).
 *
 * Optionally excludes the standard lunch break (12:00 PM - 1:00 PM) from
 * the result, only counting the portion of that hour that actually
 * overlaps the given time range.
 *
 * Output format:
 * - If the resulting minutes component is `00`, returns a whole number (e.g. `3`).
 * - Otherwise, returns hours and minutes joined by a dot (e.g. `3.15` for 3 hours 15 minutes).
 *
 * Note: This is NOT a true decimal-hour conversion (3h15m is not mathematically 3.25).
 * The minutes are appended as-is after the decimal point, per the required output format.
 *
 * @param startTime - Start time, e.g. "08:30" or "08:30:00"
 * @param endTime - End time, e.g. "11:45" or "11:45:00"
 * @param excludeLunchBreak - If `true`, subtracts any overlap with 12:00 PM - 1:00 PM. Defaults to `false`.
 * @returns The hour difference as a number, e.g. `3` or `3.15`
 *
 * @throws {Error} If either time string is not a valid HH:mm or HH:mm:ss format
 *
 * @example
 * getHoursBetween("08:00", "11:00");                 // 3
 * getHoursBetween("08:00", "11:15");                  // 3.15
 * getHoursBetween("08:00:00", "11:05:45");            // 3.05 (seconds are ignored in the result)
 * getHoursBetween("22:00", "02:00");                  // 4    (wraps past midnight)
 * getHoursBetween("09:00", "09:00");                  // 0
 *
 * // Lunch break exclusion
 * getHoursBetween("08:00", "17:00", true);            // 8    (9 hours minus the 1-hour lunch break)
 * getHoursBetween("08:00", "17:00", false);            // 9    (lunch break not excluded)
 * getHoursBetween("12:30", "13:30", true);            // 0.30 (only 30 min worked; 12:30-13:00 is lunch)
 * getHoursBetween("09:00", "12:00", true);            // 3    (no overlap with lunch break, unaffected)
 */
export function getHoursBetween(
  startTime: string,
  endTime: string,
  excludeLunchBreak = false
): number {
  const startMinutes = parseTimeToMinutes(startTime);
  let endMinutes = parseTimeToMinutes(endTime);

  // Handle ranges that cross midnight (e.g. 22:00 -> 02:00)
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  let totalMinutes = endMinutes - startMinutes;

  if (excludeLunchBreak) {
    totalMinutes -= getOverlapMinutes(
      startMinutes,
      endMinutes,
      LUNCH_BREAK_START_MINUTES,
      LUNCH_BREAK_END_MINUTES
    );

    // If the range wraps past midnight, also check the next day's lunch window
    if (endMinutes > 24 * 60) {
      totalMinutes -= getOverlapMinutes(
        startMinutes,
        endMinutes,
        LUNCH_BREAK_START_MINUTES + 24 * 60,
        LUNCH_BREAK_END_MINUTES + 24 * 60
      );
    }
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return hours;
  }

  return Number(`${hours}.${minutes.toString().padStart(2, '0')}`);
}

/**
 * Calculates how many minutes two ranges [rangeStart, rangeEnd) and
 * [windowStart, windowEnd) overlap.
 *
 * @internal
 */
function getOverlapMinutes(
  rangeStart: number,
  rangeEnd: number,
  windowStart: number,
  windowEnd: number
): number {
  const overlapStart = Math.max(rangeStart, windowStart);
  const overlapEnd = Math.min(rangeEnd, windowEnd);
  return Math.max(0, overlapEnd - overlapStart);
}

/**
 * Parses a time string (`HH:mm` or `HH:mm:ss`) into total minutes since 00:00.
 * Seconds, if present, are validated but not included in the result.
 *
 * @internal
 * @param time - Time string to parse
 * @returns Total minutes since midnight
 * @throws {Error} If the string doesn't match `HH:mm` or `HH:mm:ss`
 */
function parseTimeToMinutes(time: string): number {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(time);

  if (!match) {
    throw new Error(`Invalid time format: "${time}". Expected HH:mm or HH:mm:ss.`);
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  return hours * 60 + minutes;
}

