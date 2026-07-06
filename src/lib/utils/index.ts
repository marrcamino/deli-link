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
 * Formats a count with the correct singular or plural form of a word.
 *
 * If `plural` is not provided, it defaults to `singular` with an "s" appended.
 *
 * @param count - The number used to determine singular or plural form
 * @param singular - The singular form of the word
 * @param plural - The plural form of the word. Defaults to `singular + "s"`
 * @returns A string combining the count and the correctly pluralized word
 *
 * @example
 * ```ts
 * pluralize(1, "day")
 * // "1 day"
 * ```
 *
 * @example
 * ```ts
 * pluralize(5, "day")
 * // "5 days"
 * ```
 *
 * @example
* ```ts
 * pluralize(2, "child", "children")
 * // "2 children"
 * ``` 
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  return `${count} ${count > 1 ? plural ?? singular + "s" : singular}`;
}

export * from "./windows"
export * from "./date-utils"
export * from "./name-formatter"
export * from "./time-utils"
export * from "./date-prettifier"