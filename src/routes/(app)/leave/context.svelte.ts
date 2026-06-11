import { DEFAULT_SETTINGS, type LeaveTypeKey } from "$lib/constants";
import { getLeaveApplications, getLeaveBalance, getUsers } from "$lib/services";
import type { LeaveApplicationWithDate } from "$lib/types";
import { getContext, setContext, untrack } from "svelte";
import type { UserWithLeaveStatus } from "./tbl-schema";

const CONTEXT_KEY = Symbol("leave-context");

class LeaveContext {
  users: UserWithLeaveStatus[] = $state([])
  listOfLeave: LeaveApplicationWithDate[] = $state([]);

  // When editing
  openUser: UserWithLeaveStatus | null = $state(null)
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
    getUsers().then(u => {
      this.users = u.map(u => ({
        ...u, wellnesslLeaveBal: 0,
        personalLeaveBal: 0,
        pending: 0
      }))
    })

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
    this.listOfLeave = (await this.getLeaveApplications(id)).reverse();
  }

  private getLeaveBalance() {
    if (!this.listOfLeave.length) return { wellness: DEFAULT_SETTINGS.maxWellnessLeave, office: DEFAULT_SETTINGS.maxPersonalLeave }

    const getApprovedLeave = (leaveType: LeaveTypeKey) => {
      if (!this.listOfLeave.length) return []
      return this.listOfLeave.filter(l => l.is_approved && l.leave_type === leaveType)
    }

    const getTotalDays = (approvedLeave: LeaveApplicationWithDate[]) => approvedLeave.reduce((acc, leave) => {
      return acc + leave.dates.length;
    }, 0)


    return {
      wellness: DEFAULT_SETTINGS.maxWellnessLeave - getTotalDays(getApprovedLeave("WELLNESS")),
      office: DEFAULT_SETTINGS.maxPersonalLeave - getTotalDays(getApprovedLeave("PERSONAL"))
    }
  }

  private updateUserInfo(user: Partial<UserWithLeaveStatus> & { user_pk: number }) {
    this.users = this.users.map(u => u.user_pk === user.user_pk ? { ...u, ...user } : u)
  }

  async getLeaveApplications(id: number, approveStatus?: 'approved' | 'not_approved') {
    return await getLeaveApplications(id, { year: this.selectedYear.toString(), approvalStatus: approveStatus })
  }

  addLeave(newLeave: LeaveApplicationWithDate) {
    this.listOfLeave = [newLeave, ...this.listOfLeave]
  }
  removeLeave(id: number) {
    this.listOfLeave = this.listOfLeave.filter(l => l.leave_pk !== id)
  }
  updateLeave(leave: Partial<LeaveApplication> & { leave_pk: number }) {
    this.listOfLeave = this.listOfLeave.map((l) =>
      l.leave_pk === leave.leave_pk
        ? { ...l, ...leave }
        : l
    );
  }

  async openSheet(user: UserWithLeaveStatus) {
    this.openUser = user
    this.sheetState = true
    await this.loadLeaveApplications(user.user_pk)
  }

  async refreshLeaveInfo(userPk: number) {
    const asOfDate = `${this.selectedYear}-12-31`
    const [wellnessBal, personalBal, pending] = await Promise.all([
      getLeaveBalance(userPk, {
        leaveType: "WELLNESS",
        asOfDate,
      }),
      getLeaveBalance(userPk, {
        leaveType: "PERSONAL",
        asOfDate,
      }),
      (await this.getLeaveApplications(userPk, 'not_approved')).length
    ]);

    this.updateUserInfo({
      user_pk: userPk,
      wellnesslLeaveBal: DEFAULT_SETTINGS.maxWellnessLeave - wellnessBal,
      personalLeaveBal: DEFAULT_SETTINGS.maxPersonalLeave - personalBal,
      pending
    });
  }

  openLeaveDialog(user: UserWithLeaveStatus) {
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

