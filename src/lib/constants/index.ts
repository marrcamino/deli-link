export const LEAVE_TYPE_MAP = {
  WELLNESS: "Wellness Leave",
  OFFICE: "Office Leave",
} as const
export type LeaveTypeKey = keyof typeof LEAVE_TYPE_MAP
export type LeaveTypeValue = typeof LEAVE_TYPE_MAP[keyof typeof LEAVE_TYPE_MAP];

export * from "./months";

