import { buildUrlWithQuery } from "@/lib/queryBuilder";
import type { ListUsersQuery } from "./types";

export const usersEndpoints = {
  list: (q?: ListUsersQuery) => buildUrlWithQuery("/users", q as Record<string, string | number | boolean | null | undefined>),
  detail: (id: string) => `/users/${id}`,
  create: () => `/users`,
  update: (id: string) => `/users/${id}`,
  destroy: (id: string) => `/users/${id}`
} as const;
