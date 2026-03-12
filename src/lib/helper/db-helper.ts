import { getDBConn } from "$lib/db";

export async function isUserIsExistInDatabase(user_pk: number) {
  const db = await getDBConn();
  const res = await db.select<{ user_exists: number }[]>(
    "SELECT EXISTS(SELECT 1 FROM user WHERE user_pk = ?) AS user_exists",
    [user_pk]
  );

  return !res[0]?.user_exists
}


export async function getUser(user_pk: number) {
  const db = await getDBConn();
  const res = await db.select<User[]>(
    "SELECT * FROM user WHERE user_pk = ? LIMIT 1",
    [user_pk]
  );

  if (!res.length) return undefined

  return res[0]
}