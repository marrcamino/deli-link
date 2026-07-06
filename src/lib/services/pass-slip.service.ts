import type { PassSlipTypeKey } from "$lib/constants";
import { getDBConn } from "$lib/db";
import type { PassSlipWithDates } from "$lib/types";
import { NativeDateHelper } from "$lib/utils";

export async function getPassSlipsWithDates(
  userId: number | string,
  options?: {
    year?: number | string,
    month?: number | string,
    approvalStatus?: 'approved' | 'not_approved',
    slip_type?: PassSlipTypeKey;
  }
): Promise<PassSlipWithDates[]> {
  const db = await getDBConn();

  const conditions: string[] = ['user_fk = ?'];
  const params: any[] = [userId];

  const yearStr = options?.year?.toString() || NativeDateHelper.currentYear;
  conditions.push("strftime('%Y', filed_at) = ?");
  params.push(yearStr);


  if (options?.month) {
    const monthVal = options.month.toString().padStart(2, '0');
    conditions.push("strftime('%m', filed_at) = ?");
    params.push(monthVal);
  }


  if (options?.approvalStatus === 'approved') conditions.push('is_approved = 1');
  if (options?.approvalStatus === 'not_approved') conditions.push('is_approved = 0');

  if (options?.slip_type === 'OFFICIAL') conditions.push("slip_type = 'OFFICIAL'");
  if (options?.slip_type === 'PERSONAL') conditions.push("slip_type = 'PERSONAL'");


  const passSlipQuery = `
    SELECT *
    FROM pass_slip
    WHERE ${conditions.join(' AND ')}
    ORDER BY filed_at ASC
  `;

  const passSlips = await db.select<PassSlip[]>(passSlipQuery, params);

  if (passSlips.length === 0) return [];

  // Get all pass slips IDs
  const passSlipsIds = passSlips.map(p => p.pass_slip_pk);

  // Build placeholders (?, ?, ?)
  const placeholders = passSlipsIds.map(() => '?').join(',');

  const datesQuery = `
    SELECT *
    FROM pass_slip_date
    WHERE pass_slip_fk IN (${placeholders})
    ORDER BY date_value ASC
  `;

  const dates = await db.select<PassSlipDate[]>(datesQuery, passSlipsIds);

  // Group dates by pass_slip_fk
  const dateMap = new Map<number, PassSlipDate[]>();

  for (const d of dates) {
    if (!dateMap.has(d.pass_slip_fk)) dateMap.set(d.pass_slip_fk, []);
    dateMap.get(d.pass_slip_fk)!.push(d);
  }

  // Attach dates to each pass slip
  return passSlips.map(passSlip => ({
    ...passSlip,
    dates: dateMap.get(passSlip.pass_slip_pk) ?? []
  }));
}

type DeletePassSlipResult =
  | { success: true; pass_slip_pk: number }
  | { success: false; message: string };

export async function deletePassSlip(
  pass_slip_pk: PassSlip["pass_slip_pk"]
): Promise<DeletePassSlipResult> {
  try {
    const db = await getDBConn();

    const res = await db.execute(
      "DELETE FROM pass_slip WHERE pass_slip_pk = ?",
      [pass_slip_pk]
    );

    if (!res.rowsAffected) {
      return {
        success: false,
        message: "There was an error while deleting pass slip",
      };
    }

    return { success: true, pass_slip_pk };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Unknown database error",
    };
  }
}