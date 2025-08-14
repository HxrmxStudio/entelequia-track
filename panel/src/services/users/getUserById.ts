import { apiFetch } from "@/app/lib/api";
import { usersEndpoints } from "./endpoints";
import type { User } from "./types";

export async function getUserById(id: string): Promise<User> {
  return apiFetch<User>(usersEndpoints.detail(id));
}
