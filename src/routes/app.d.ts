declare global {
  interface Employee {
    employee_pk: number;
    last_name: string;
    first_name: string;
    middle_name: string | null;
    designation: string
  }
}

export { };
