import type { LeaveTypeKey } from "$lib/constants";
import { getDBConn } from "$lib/db";
import type { LeaveApplicationWithDate } from "$lib/types";
import { NativeDateHelper } from "$lib/utils";

/**
 * Retrieves leave applications for a specific user with optional filtering.
 *
 * @async
 * @param {number | string} userId - The ID of the user whose leave applications are being retrieved.
 * @param {Object} [options] - Optional filters to refine the results.
 * @param {number | string} [options.year] - The year to filter by. Defaults to the current year if not provided.
 * @param {number | string} [options.month] - The month to filter by (1-12). If provided, filters results to that specific month.
 * @param {'approve_only' | 'not_approve_only'} [options.approveStatus] - Filter to show only approved or only non-approved applications.
 * @param {LeaveTypeKey} [options.leaveType] - Filter by a specific type of leave (e.g., 'Wellness Leave', 'Office Leave').
 * @returns {Promise<LeaveApplicationWithDate[]>} A list of leave applications including their nested date details.
 */
export async function getLeaveApplications(
  userId: number | string,
  options?: {
    year?: number | string,
    month?: number | string,
    approveStatus?: 'approve_only' | 'not_approve_only',
    leaveType?: LeaveTypeKey
  }
): Promise<LeaveApplicationWithDate[]> {
  const db = await getDBConn();

  const conditions: string[] = ['user_fk = ?'];
  const params: any[] = [userId];

  const yearStr = options?.year?.toString() || NativeDateHelper.currentYear;
  conditions.push("strftime('%Y', created_at) = ?");
  params.push(yearStr);

  if (options?.month) {
    const monthVal = options.month.toString().padStart(2, '0');
    conditions.push("strftime('%m', created_at) = ?");
    params.push(monthVal);
  }

  if (options?.approveStatus === 'approve_only') conditions.push('is_approved = 1');
  if (options?.approveStatus === 'not_approve_only') conditions.push('is_approved = 0');

  if (options?.leaveType === 'WELLNESS') conditions.push('leave_type = 1');
  if (options?.leaveType === 'OFFICE') conditions.push('leave_type = 2');

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