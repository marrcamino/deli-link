import { getDBConn } from "$lib/db";
import type { LeaveApplicationWithDate } from "$lib/types";
import { NativeDateHelper } from "$lib/utils";

/**
 * Fetches leave applications for a specific user and year, with optional approval status filtering.
 *
 * @param userId - The ID of the user whose leave applications are being fetched.
 * @param year - The year to filter leave applications by. Defaults to the current year.
 * @param approveStatus - Optional filter to get only approved or not approved leave applications.
 *                        - `'approve_only'` returns only approved leaves.
 *                        - `'not_approve_only'` returns only unapproved leaves.
 * @returns A promise that resolves to an array of `LeaveApplication` objects matching the criteria.
 *
 * @example
 * const leaves = await getLeaveApplications(123);
 * const approvedLeaves = await getLeaveApplications(123, 2026, 'approve_only');
 */
export async function getLeaveApplications(
  userId: number | string,
  year: number | string = NativeDateHelper.currentYear,
  approveStatus?: 'approve_only' | 'not_approve_only'
): Promise<LeaveApplicationWithDate[]> {
  const db = await getDBConn();

  const conditions: string[] = ['user_fk = ?'];
  const params: any[] = [userId];

  const yearStr = year.toString();
  conditions.push("strftime('%Y', created_at) = ?");
  params.push(yearStr);

  if (approveStatus === 'approve_only') conditions.push('is_approved = 1');
  if (approveStatus === 'not_approve_only') conditions.push('is_approved = 0');

  const leaveQuery = `
    SELECT *
    FROM leave_application
    WHERE ${conditions.join(' AND ')}
    ORDER BY created_at ASC
  `;

  const leaves = await db.select<LeaveApplication[]>(leaveQuery, params);

  if (leaves.length === 0) return [];

  // get all leave IDs
  const leaveIds = leaves.map(l => l.leave_pk);

  // build placeholders (?, ?, ?)
  const placeholders = leaveIds.map(() => '?').join(',');

  const datesQuery = `
    SELECT *
    FROM leave_date
    WHERE leave_fk IN (${placeholders})
    ORDER BY date_value ASC
  `;

  const dates = await db.select<LeaveDate[]>(datesQuery, leaveIds);

  // group dates by leave_fk
  const dateMap = new Map<number, LeaveDate[]>();

  for (const d of dates) {
    if (!dateMap.has(d.leave_fk)) {
      dateMap.set(d.leave_fk, []);
    }
    dateMap.get(d.leave_fk)!.push(d);
  }

  // attach dates to each leave
  return leaves.map(leave => ({
    ...leave,
    dates: dateMap.get(leave.leave_pk) ?? []
  }));
}