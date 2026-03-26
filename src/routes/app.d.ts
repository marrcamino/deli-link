import type { UserPrefKeys } from "$lib/types"
import type { LeaveTypeKey } from "$lib/constants"

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
    user_fk: User["user_pk"];
    date: string;
    time: string;
  }

  interface LeaveApplication {
    leave_pk: number;
    user_fk: User["user_pk"];
    date_file: string;
    leave_type: LeaveTypeKey;
    is_approved: Bit;
    /** ex. 1999-01-01 06:30:55 */
    created_at: string;
  }

  interface LeaveDate {
    leave_date_pk: number;
    leave_fk: LeaveApplication['leave_pk'];
    date_value: string;
  }

  interface UserPref<K extends keyof UserPrefKeys = keyof UserPrefKeys> {
    pref_key: K
    pref_value: UserPrefKeys[K]
  }
}

export { };
