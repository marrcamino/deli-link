import { getDBConn } from "$lib/db";
import type { UserPrefKeys, UserPrefRow } from "$lib/types";

export async function setUserPref<K extends keyof UserPrefKeys>(
  key: K,
  value: UserPrefKeys[K]
) {
  const db = await getDBConn()
  
  await db.execute(
    `
      INSERT OR REPLACE INTO user_pref (pref_key, pref_value)
      VALUES (?, ?)
    `,
    [key, value]
  )
}

export async function getUserPref<K extends keyof UserPrefKeys>(
  key: K
): Promise<UserPrefKeys[K] | null> { // no null
  const db = await getDBConn();

  const rows = await db.select<{ pref_value: UserPrefKeys[K] }[]>(
    `SELECT pref_value FROM user_pref WHERE pref_key = ?`,
    [key]
  );

  const row = rows[0];

  if (!row) return null;

  return row.pref_value;
}


export async function getUserPrefs(): Promise<UserPrefRow[]> {
  const db = await getDBConn();

  const rows = await db.select<UserPrefRow[]>(
    `SELECT * FROM user_pref`
  );

  return rows; // each row is typed correctly
}