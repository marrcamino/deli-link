import { getDBConn } from '$lib/db';
import { countTotalLeaveDays } from "$lib/helper";
import { getLeaveApplications } from '$lib/services';
import type { PageLoad } from './$types';


export const load: PageLoad = async ({ params }) => {

  if (isNaN(Number(params.id))) return { userLeave: null, leaveLeft: null }

  const db = await getDBConn()

  const sql = `
    SELECT 
      l.*,
      u.*
    FROM leave_application AS l
    JOIN user AS u 
      ON l.user_fk = u.user_pk
    WHERE l.leave_pk = ?
  `;
  const userLeave = (await db.select<any>(sql, [params.id]))[0] as LeaveApplication & User

  const allApprovedLeave = await getLeaveApplications(userLeave.user_fk, undefined, 'approve_only')

  return {
    userLeave,
    leaveLeft: countTotalLeaveDays(allApprovedLeave)
  }
};