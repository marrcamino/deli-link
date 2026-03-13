import { getDBConn } from "$lib/db";
import { getUsers } from "$lib/helper/db-helper";
import { getContext, setContext } from "svelte";

const CONTEXT_KEY = Symbol("leave-context");

class LeaveContext {
  users: User[] = $state([])
  openUser: User | null = $state(null)
  openLeave: LeaveApplication | null = $state(null)

  sheetState = $state(false)
  addEditDialogState = $state(false)
  deleteDialogState = $state(false)

  listOfLeave: LeaveApplication[] = $state([])

  constructor() {
    getUsers().then(u => this.users = u)
  }

  private async loadLeaveApplications(id: number) {
    const db = await getDBConn()

    this.listOfLeave = await db.select<LeaveApplication[]>(`
      SELECT * from leave_application WHERE user_fk = ? ORDER BY inclusive_to ASC
      `, [id])
  }

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