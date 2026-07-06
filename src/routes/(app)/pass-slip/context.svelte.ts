import { getUsers, getPassSlipsWithDates } from "$lib/services";
import type { PassSlipWithDates } from "$lib/types";
import { getContext, setContext, untrack } from "svelte";

const CONTEXT_KEY = Symbol("pass-slip-context");

class PassSlipContext {
  users: User[] = $state([])
  passSlips: PassSlipWithDates[] = $state([])

  // When editing
  openUser: User | null = $state(null)
  openSlip: PassSlipWithDates | null = $state(null)

  // Dialog and sheet states
  sheetState = $state(false)
  addEditDialogState = $state(false)
  deleteDialogState = $state(false)

  selectedYear = $state(new Date().getFullYear().toString())
  constructor() {
    getUsers().then(u => this.users = u)


    $effect(() => {
      this.openUser;

      untrack(async () => {
        if (!this.openUser) return
        this.passSlips = await getPassSlipsWithDates(this.openUser.user_pk)
      })
    })
  }


  addPassSlip(passSlip: PassSlipWithDates) {
    this.passSlips = [passSlip, ...this.passSlips]
  }

  removeLeave(pass_slip_pk: number) {
    this.passSlips = this.passSlips.filter(p => p.pass_slip_pk !== pass_slip_pk)
  }

  updatePassSlip(passSlip: Partial<PassSlipWithDates> & { pass_slip_pk: number }) {
    this.passSlips = this.passSlips.map((p) =>
      p.pass_slip_pk === passSlip.pass_slip_pk
        ? { ...p, ...passSlip }
        : p
    );
  }
}

export function setPassSlipContext() {
  return setContext(CONTEXT_KEY, new PassSlipContext)
}

export function getPassSlipContext() {
  return getContext(CONTEXT_KEY) as PassSlipContext
}