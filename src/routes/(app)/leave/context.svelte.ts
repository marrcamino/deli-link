import { getDBConn } from "$lib/db";
import { getUsers } from "$lib/helper/db-helper";
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

  async getLeaveApplications(id: number) {
    const db = await getDBConn()
    return await db.select<LeaveApplication[]>(`
        SELECT *
        FROM leave_application
        WHERE user_fk = ?
          AND strftime('%Y', inclusive_from) = ?
        ORDER BY inclusive_to ASC
      `, [id, this.selectedYear.toString()]);
  }

  countTotalLeaveDays(applications: LeaveApplication[]) {
    return applications.reduce((total, leave) => {
      // Append '+08:00' to force Philippines offset if the string is just 'YYYY-MM-DD'
      const start = new Date(`${leave.inclusive_from}T00:00:00+08:00`);
      const end = new Date(`${leave.inclusive_to}T00:00:00+08:00`);

      const diffInMs = end.getTime() - start.getTime();

      // Convert ms to days and add 1 for inclusivity
      const days = Math.round(diffInMs / (1000 * 60 * 60 * 24)) + 1;

      return total + (days > 0 ? days : 0);
    }, 0);
  };

  add(newLeave: LeaveApplication) {
    this.listOfLeave = [newLeave, ...this.listOfLeave]
  }
  remove(id: number) {
    this.listOfLeave = this.listOfLeave.filter(l => l.leave_pk !== id)
  }
  update(leave: LeaveApplication) {
    this.listOfLeave = this.listOfLeave.map((l) => l.leave_pk === leave.leave_pk ? leave : l)
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