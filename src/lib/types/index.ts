export type UserPrefKeys = {
  /** DTR Open Tab */
  dtr_open_tab: 'users' | 'logs';
}

export type UserPrefRow = {
  [K in keyof UserPrefKeys]: {
    pref_key: K
    pref_value: UserPrefKeys[K]
  }
}[keyof UserPrefKeys]