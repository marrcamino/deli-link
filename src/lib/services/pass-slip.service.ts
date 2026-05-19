import { getDBConn } from "$lib/db";
import type { PassSlipTypeKey } from "$lib/constants";

type GetPassSlipOptions = {
  year?: number;
  approveStatus?: 'approve_only' | 'not_approve_only',
  slip_type?: PassSlipTypeKey;
};

type PassSlipRow = PassSlip & {
  date_value: string;
};

type PassSlipWithDates = PassSlip & {
  dates: string[];
};

export async function getPassSlipsWithDates(
  userId: number | string,
  options: GetPassSlipOptions = {}
): Promise<PassSlipWithDates[]> {
  const db = await getDBConn();

  const { year, approveStatus, slip_type } = options;

  let query = `
    SELECT 
      ps.pass_slip_pk,
      ps.user_fk,
      ps.start_time,
      ps.end_time,
      ps.slip_type,
      ps.signatory_fk,
      ps.is_approved,
      ps.filed_at,
      ps.created_at,
      psd.date_value
    FROM pass_slip ps
    JOIN pass_slip_date psd
      ON ps.pass_slip_pk = psd.pass_slip_fk
    WHERE ps.user_fk = ?
  `;

  const params: any[] = [userId];

  if (year) {
    query += ` AND strftime('%Y', psd.date_value) = ?`;
    params.push(String(year));
  }

  if (approveStatus !== undefined) {
    query += ` AND ps.is_approved = ?`;
    params.push(approveStatus === 'approve_only' ? 1 : 0);
  }

  if (slip_type) {
    query += ` AND ps.slip_type = ?`;
    params.push(slip_type);
  }

  query += ` ORDER BY ps.created_at DESC`;

  const rows = await db.select<PassSlipRow[]>(query, params);

  const map = new Map<number, PassSlipWithDates>();

  for (const row of rows) {
    const id = row.pass_slip_pk;

    if (!map.has(id)) {
      map.set(id, {
        pass_slip_pk: row.pass_slip_pk,
        user_fk: row.user_fk,
        start_time: row.start_time,
        end_time: row.end_time,
        slip_type: row.slip_type,
        signatory_fk: row.signatory_fk,
        is_approved: row.is_approved,
        filed_at: row.filed_at,
        created_at: row.created_at,
        dates: [],
      });
    }

    map.get(id)!.dates.push(row.date_value);
  }

  return Array.from(map.values());
}