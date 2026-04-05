export const LEAVE_TYPE_MAP = {
  WELLNESS: "Wellness Leave",
  PERSONAL: "Personal Leave",
} as const
export type LeaveTypeKey = keyof typeof LEAVE_TYPE_MAP
export type LeaveTypeValue = typeof LEAVE_TYPE_MAP[keyof typeof LEAVE_TYPE_MAP];

export const PASS_SLIP_TYPE_MAP = {
  PERSONAL: "Personal Pass Slip",
  OFFICIAL: "Official Business Pass Slip"
} as const
export type PassSlipTypeKey = keyof typeof PASS_SLIP_TYPE_MAP
export type PassSlipTypeValue = typeof PASS_SLIP_TYPE_MAP[keyof typeof PASS_SLIP_TYPE_MAP];

export * from "./months";

