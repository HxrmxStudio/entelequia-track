import { apiFetch } from "@/app/lib/api";
import { usersEndpoints } from "./endpoints";
import type { User, ListUsersQuery } from "./types";

export async function listUsers(filters: ListUsersQuery = {}): Promise<User[]> {
  return apiFetch<User[]>(usersEndpoints.list(filters));
}
