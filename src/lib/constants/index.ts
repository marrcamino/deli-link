export const LEAVE_TYPE_MAP = {
  1: "Wellness Leave",
  2: "Office Leave",
} as const
export type LeaveTypeKey = keyof typeof LEAVE_TYPE_MAP
export type LeaveType = typeof LEAVE_TYPE_MAP[keyof typeof LEAVE_TYPE_MAP];

export * from "./months"