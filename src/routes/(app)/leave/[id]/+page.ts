import { getDBConn } from '$lib/db';
import { countTotalLeaveDays } from "$lib/helper";
import { getLeaveApplications, getLeaveBalance } from '$lib/services';
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
  const days = await db.select<LeaveDate[]>("SELECT * FROM leave_date WHERE leave_fk = ?", [params.id])

  const allApprovedLeave = await getLeaveApplications(userLeave.user_fk, {
    approvalStatus: "approved",
    leaveType: userLeave.leave_type
  })

  let allApproveLeaveDates: LeaveDate[] = []

  for (const approvedLeave of allApprovedLeave) {
    const theDays = await db.select<LeaveDate[]>("SELECT * FROM leave_date WHERE leave_fk = ?", [approvedLeave.leave_pk])
    allApproveLeaveDates = [...theDays, ...allApproveLeaveDates]
  }

  const leaveBalance = await getLeaveBalance(userLeave.user_pk, { asOfDate: userLeave.date_file, leaveType: "WELLNESS" })

  return {
    userLeave,
    days,
    allApproveLeaveDates,
    leaveLeft: leaveBalance
  }
};