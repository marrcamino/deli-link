import { setContext, getContext } from "svelte";
const CONTEXT_KEY = Symbol("employee-context");


class EmployeeContext {
  empAddDialog = $state(false)
}

export function setEmployeeContext() {
  return setContext(CONTEXT_KEY, new EmployeeContext)
}

export function getEmployeeContext(){
  return getContext(CONTEXT_KEY) as EmployeeContext
}