declare global {
  interface User {
    user_pk: number;
    last_name: string;
    first_name: string;
    middle_name: string | null;
    extension: string | null;
    designation: string
  }
}

export { };
