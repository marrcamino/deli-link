import { getDBConn } from "$lib/db";
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
): Promise<LeaveApplication[]> {
  const db = await getDBConn();

  const conditions: string[] = ['user_fk = ?'];
  const params: any[] = [userId];

  const yearStr = year.toString();
  conditions.push("strftime('%Y', inclusive_from) = ?");
  params.push(yearStr);

  if (approveStatus === 'approve_only') conditions.push('is_approved = 1');
  if (approveStatus === 'not_approve_only') conditions.push('is_approved = 0');

  const query = `
    SELECT *
    FROM leave_application
    WHERE ${conditions.join(' AND ')}
    ORDER BY inclusive_to ASC
  `;

  return await db.select<LeaveApplication[]>(query, params);
}