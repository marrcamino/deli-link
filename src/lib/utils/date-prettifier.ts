import type { DateValue } from "@internationalized/date";

type DateObj = { year: number; month: number; day: number };

// Helper: Parse string to DateObj
function parseDateStr(dateStr: string): DateObj {
  const d = new Date(dateStr);
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

// Helper: Sort DateObj array
function sortDates(dates: DateObj[]): DateObj[] {
  return dates.sort((a, b) =>
    a.year !== b.year
      ? a.year - b.year
      : a.month !== b.month
        ? a.month - b.month
        : a.day - b.day
  );
}

// Helper: Group dates by year
function groupByYear(dates: DateObj[]): Map<number, DateObj[]> {
  const map = new Map<number, DateObj[]>();
  for (const d of dates) {
    if (!map.has(d.year)) map.set(d.year, []);
    map.get(d.year)!.push(d);
  }
  return map;
}

// Helper: Group dates by month within a year
function groupByMonth(dates: DateObj[]): Map<number, DateObj[]> {
  const map = new Map<number, DateObj[]>();
  for (const d of dates) {
    if (!map.has(d.month)) map.set(d.month, []);
    map.get(d.month)!.push(d);
  }
  return map;
}

// Helper: Find consecutive day ranges and singles in a sorted array of days
function buildRanges(days: number[]): (number | [number, number])[] {
  const result: (number | [number, number])[] = [];
  let start = days[0];
  let prev = days[0];

  for (let i = 1; i <= days.length; i++) {
    if (i === days.length || days[i] !== prev + 1) {
      if (start === prev) {
        result.push(start);
      } else {
        result.push([start, prev]);
      }
      if (i < days.length) {
        start = days[i];
        prev = days[i];
      }
    } else {
      prev = days[i];
    }
  }
  return result;
}

// Helper: Format month number to short name (Jan, Feb...)
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatRange(r: number | [number, number]): string {
  if (typeof r === "number") return r.toString();
  return `${r[0]}-${r[1]}`;
}

export function prettifyDates(dateStrs: string[] | DateValue[]): string {
  // Deduplicate first
  const unique = Array.from(new Set(dateStrs.map(d => d.toString())));

  // Parse and sort dates
  const dates = sortDates(unique.map(parseDateStr));

  // Group by year
  const yearsMap = groupByYear(dates);

  const parts: string[] = [];

  for (const [year, yearDates] of yearsMap.entries()) {
    // Group by month within this year
    const monthsMap = groupByMonth(yearDates);

    const monthParts: string[] = [];

    for (const [month, monthDates] of monthsMap.entries()) {
      // Extract days and sort
      const days = monthDates.map((d) => d.day).sort((a, b) => a - b);
      const ranges = buildRanges(days);

      // Format days/ranges
      const dayStr = ranges.map(formatRange).join(",");

      monthParts.push(`${monthNames[month - 1]} ${dayStr}`);
    }

    // Join months with semicolon
    const yearStr = monthParts.join("; ") + `, ${year}`;
    parts.push(yearStr);
  }

  // Join different years with semicolon
  return parts.join("; ");
}

// Convert DateObj to JS Date
function toDate(d: DateObj) {
  return new Date(d.year, d.month - 1, d.day);
}

export function buildContinuousRanges(
  dateStrs: string[]
): [DateObj, DateObj][] {
  if (!dateStrs.length) return [];

  const sorted = Array.from(new Set(dateStrs))
    .map(parseDateStr)
    .sort((a, b) => toDate(a).getTime() - toDate(b).getTime());

  const ranges: [DateObj, DateObj][] = [];
  let start = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i <= sorted.length; i++) {
    const current = sorted[i];
    if (
      !current ||
      toDate(current).getTime() - toDate(prev).getTime() !== 86400000
    ) {
      ranges.push([start, prev]);
      start = current;
    }
    prev = current;
  }

  return ranges;
}
