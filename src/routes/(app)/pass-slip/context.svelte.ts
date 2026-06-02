import { getUsers, getPassSlipsWithDates } from "$lib/services";
import { getContext, setContext, untrack } from "svelte";

const CONTEXT_KEY = Symbol("pass-slip-context");

type PassSlipWithDates = PassSlip & {
  dates: string[];
};

class PassSlipContext {
  users: User[] = $state([])
  passSlips: PassSlipWithDates[] = $state([])

  // When editing
  openUser: User | null = $state(null)
  openSlip: PassSlip | null = $state(null)

  // Dialog and sheet states
  sheetState = $state(false)
  addEditDialogState = $state(false)
  deleteDialogState = $state(false)

  selectedYear = $state(new Date().getFullYear().toString())
  constructor() {
    getUsers().then(u => this.users = u)


    $effect(() => {
      this.openUser;

      untrack(() => {
        if (!this.openUser) return
        getPassSlipsWithDates(this.openUser.user_pk).then(p => this.passSlips = p)
      })
    })
  }
}

export function setPassSlipContext() {
  return setContext(CONTEXT_KEY, new PassSlipContext)
}

export function getPassSlipContext() {
  return getContext(CONTEXT_KEY) as PassSlipContext
}