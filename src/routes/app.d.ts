import type UserPrefKeys from "$lib/types"

declare global {
  // namespace App {
  //   interface Locals {
  //     db: Awaited<ReturnType<typeof getDBConn>>;
  //   }
  // }

  type Bit = 0 | 1;

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
    date_file: string;
    inclusive_from: string;
    inclusive_to: string;
    is_approved: Bit;
  }

  interface UserPref<K extends keyof UserPrefKeys = keyof UserPrefKeys> {
    pref_key: K
    pref_value: UserPrefKeys[K]
  }
}

export { };
