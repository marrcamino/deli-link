import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any }
  ? Omit<T, "children">
  : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
  ref?: U | null;
};

/**
 * Converts a record of key-value pairs into an array of { value, label } objects.
 * Both `value` and `label` will always be strings.
 *
 * @template T - The record key type (number or string).
 * @param {Record<T, string>} map - The record to convert.
 * @returns {{ value: string; label: string }[]} - An array of objects with stringified value and label properties.
 *
 * @example
 * const STATUS_MAP = { 1: "Active", 0: "Inactive" };
 * const statusList = mapToOptions(STATUS_MAP);
 * // Result: [ { value: "1", label: "Active" }, { value: "0", label: "Inactive" } ]
 */
export function mapToOptions<T extends string | number>(
  map: Record<T, string>
): { value: string; label: string }[] {
  return Object.entries(map).map(([value, label]) => ({
    value: String(value),
    label: String(label),
  }));
}

/**
 * Converts a 24-hour time string (`HH:mm:ss`) into a 12-hour formatted time.
 *
 * Optionally removes the seconds portion of the output.
 *
 * @param time - Time string in 24-hour format (`HH:mm:ss`)
 * @param excludeSeconds - If `true`, removes the seconds from the output. Defaults to `false`
 * @returns A formatted 12-hour time string with `AM` or `PM`
 *
 * @example
 * to12HourTime("08:16:38")
 * // "08:16:38 AM"
 *
 * @example
 * to12HourTime("14:05:10", true)
 * // "02:05 PM"
 */
export function formatTime(
  time: string,
  excludeSeconds: boolean = true
): string {
  const [h, m, s] = time.split(":").map(Number);

  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;

  const hour = String(hour12).padStart(2, "0");
  const minute = String(m).padStart(2, "0");
  const second = String(s).padStart(2, "0");

  if (excludeSeconds) {
    return `${hour}:${minute} ${period}`;
  }

  return `${hour}:${minute}:${second} ${period}`;
}


export * from "./windows"
export * from "./date-utils"
export * from "./name-formatter"
export * from "./date-prettifier"