export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type UserRole = "admin" | "ops" | "courier" | "freelance";

export interface CreateUserPayload {
  user: {
    email: string;
    role: UserRole;
    name?: string | null;
    active?: boolean;
    password?: string; // required for creation
  };
}

export interface UpdateUserPayload {
  user: Partial<Omit<CreateUserPayload["user"], "password">>;
}

export interface ListUsersQuery {
  query?: string;
  role?: UserRole;
  active?: boolean;
}
