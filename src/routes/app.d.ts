import type UserPrefKeys from "$lib/types"

declare global {
  // namespace App {
  //   interface Locals {
  //     db: Awaited<ReturnType<typeof getDBConn>>;
  //   }
  // }

  interface User {
    user_pk: number;
    last_name: string;
    first_name: string;
    middle_name: string | null;
    extension: string | null;
    designation: string
  }

  interface Log {
    log_pk: number;
    user_fk: number;
    date: string;
    time: string;
  }

  interface LeaveApplication {
    leave_pk: number;
    user_fk: number;
    inclusive_from: string;
    inclusive_to: string;
  }

  interface UserPref<K extends keyof UserPrefKeys = keyof UserPrefKeys> {
    pref_key: K
    pref_value: UserPrefKeys[K]
  }
}

export { };
