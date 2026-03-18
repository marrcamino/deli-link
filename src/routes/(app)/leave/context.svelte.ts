import { getLeaveApplications, getUsers } from "$lib/services";
import { getContext, setContext, untrack } from "svelte";
const CONTEXT_KEY = Symbol("leave-context");

class LeaveContext {
  users: User[] = $state([])
  openUser: User | null = $state(null)
  openLeave: LeaveApplication | null = $state(null)

  sheetState = $state(false)
  addEditDialogState = $state(false)
  deleteDialogState = $state(false)

  selectedYear = $state(new Date().getFullYear().toString())

  listOfLeave: LeaveApplication[] = $state([])

  constructor() {
    getUsers().then(u => this.users = u)

    $effect(() => {
      this.selectedYear;
      untrack(async () => {
        if (this.openUser) await this.loadLeaveApplications(this.openUser.user_pk)
      })
    })
  }

  private async loadLeaveApplications(id: number) {
    this.listOfLeave = await this.getLeaveApplications(id);
  }

  async getLeaveApplications(id: number, approveStatus?: 'approve_only' | 'not_approve_only') {
    return await getLeaveApplications(id, this.selectedYear.toString(), approveStatus)
  }

  add(newLeave: LeaveApplication) {
    this.listOfLeave = [newLeave, ...this.listOfLeave]
  }
  remove(id: number) {
    this.listOfLeave = this.listOfLeave.filter(l => l.leave_pk !== id)
  }

  update(leave: Partial<LeaveApplication> & { leave_pk: number }) {
    this.listOfLeave = this.listOfLeave.map((l) =>
      l.leave_pk === leave.leave_pk
        ? { ...l, ...leave } // merge instead of replace
        : l
    );
  }

  async openSheet(user: User) {
    this.openUser = user
    this.sheetState = true
    await this.loadLeaveApplications(user.user_pk)
  }

  openLeaveDialog(user: User) {
    if (!this.sheetState) {
      this.sheetState = true
      setTimeout(() => {
        this.addEditDialogState = true
      }, 300);
    } else this.addEditDialogState = true;

    this.loadLeaveApplications(user.user_pk)
    this.openUser = user
  }
}


export function setLeaveContext() {
  return setContext(CONTEXT_KEY, new LeaveContext)
}

export function getLeaveContext() {
  return getContext(CONTEXT_KEY) as LeaveContext
}

