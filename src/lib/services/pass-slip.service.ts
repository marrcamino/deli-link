import { getDBConn } from "$lib/db";




export async function getPassSlips(userId: number | string,) {
  const db = await getDBConn();
  const res = await db.select<PassSlip[]>(
    "SELECT * FROM pass_slip WHERE user_fk = ?",
    [userId]
  );

  if (!res.length) return undefined

  return res[0]
}