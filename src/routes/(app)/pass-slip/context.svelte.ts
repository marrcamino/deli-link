import { getUsers } from "$lib/services";
import { getContext, setContext } from "svelte";

const CONTEXT_KEY = Symbol("pass-slip-context");


class PassSlipContext {
  users: User[] = $state([])

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
  }
}

export function setPassSlipContext() {
  return setContext(CONTEXT_KEY, new PassSlipContext)
}

export function getPassSlipContext() {
  return getContext(CONTEXT_KEY) as PassSlipContext
}