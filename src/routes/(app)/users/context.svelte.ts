import { setContext, getContext, tick } from "svelte";
import { fly } from "svelte/transition";
import { getDBConn } from "$lib/db";

const CONTEXT_KEY = Symbol("employee-context");

class EmployeeContext {
  empAddDialogState = $state(false)
  delAlertDialogState = $state(false)
  users: User[] = $state([])
  /** Used for editing or deleting user */
  userToAlter: User | null = $state(null)

  // Acts like no transition so all rows won't animate until table init
  private transitionConfig = $state({ x: 0, duration: 0 })

  add(user: User) {
    this.users = [user, ...this.users]
  }

  remove(id: number) {
    this.users = this.users.filter(u => u.user_pk !== id)
  }

  update(user: User) {
    this.users = this.users.map(u => u.user_pk === user.user_pk ? user : u)
  }

  transFly = (node: Element) => {
    return fly(node, this.transitionConfig)
  }

  /** Initialize table data */
  async init() {
    const db = await getDBConn();
    this.users = (await db.select("SELECT * FROM user") as User[])

    await tick()
    this.transitionConfig = { x: -50, duration: 200 }
  }
}

export function setUserContext() {
  return setContext(CONTEXT_KEY, new EmployeeContext)
}

export function getUserContext() {
  return getContext(CONTEXT_KEY) as EmployeeContext
}