export type UserPrefKeys = {
  /** DTR Open Tab */
  dtr_open_tab: 'users' | 'logs';
  leave_ao_signatory: string;
  leave_head_signatory: string;
}

export type UserPrefRow = {
  [K in keyof UserPrefKeys]: {
    pref_key: K
    pref_value: UserPrefKeys[K]
  }
}[keyof UserPrefKeys]