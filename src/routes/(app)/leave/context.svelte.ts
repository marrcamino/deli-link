import type { LeaveTypeKey } from "$lib/constants";
import { getLeaveApplications, getUsers } from "$lib/services";
import type { LeaveApplicationWithDate } from "$lib/types";
import { getContext, setContext, untrack } from "svelte";

const CONTEXT_KEY = Symbol("leave-context");

class LeaveContext {
  users: User[] = $state([])
  listOfLeave: LeaveApplicationWithDate[] = $state([]);

  // When editing
  openUser: User | null = $state(null)
  openLeave: LeaveApplicationWithDate | null = $state(null)

  // Dialog and sheet states
  sheetState = $state(false)
  addEditDialogState = $state(false)
  deleteDialogState = $state(false)

  selectedYear = $state(new Date().getFullYear().toString())

  // Display info
  wellnessLeaveBal = $state(0)
  officeLeaveBal = $state(0)

  constructor() {
    getUsers().then(u => this.users = u)

    // Refetch leave applications when selected year changes
    $effect(() => {
      this.selectedYear;
      untrack(async () => {
        if (this.openUser) await this.loadLeaveApplications(this.openUser.user_pk)
      })
    })

    // Update balance if there are any leave application changes
    $effect(() => {
      this.listOfLeave;

      untrack(() => {
        const { wellness, office } = this.getLeaveBalance()
        this.wellnessLeaveBal = wellness
        this.officeLeaveBal = office
      })
    })
  }

  private async loadLeaveApplications(id: number) {
    this.listOfLeave = await this.getLeaveApplications(id);
  }

  private getLeaveBalance() {
    if (!this.listOfLeave.length) return { wellness: 0, office: 0 }

    const getApprovedLeave = (leaveType: LeaveTypeKey) => {
      if (!this.listOfLeave.length) return []
      return this.listOfLeave.filter(l => l.is_approved && l.leave_type === leaveType)
    }

    const getTotalDays = (approvedLeave: LeaveApplicationWithDate[]) => approvedLeave.reduce((acc, leave) => {
      return acc + leave.dates.length;
    }, 0)


    return {
      wellness: 5 - getTotalDays(getApprovedLeave("WELLNESS")),
      office: 2 - getTotalDays(getApprovedLeave("PERSONAL"))
    }
  }

  async getLeaveApplications(id: number, approveStatus?: 'approve_only' | 'not_approve_only') {
    return await getLeaveApplications(id, { year: this.selectedYear.toString(), approveStatus })
  }

  add(newLeave: LeaveApplicationWithDate) {
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

