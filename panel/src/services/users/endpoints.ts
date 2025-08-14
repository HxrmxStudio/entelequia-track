import type { ListUsersQuery } from "./types";

export const usersEndpoints = {
  list: (q?: ListUsersQuery) => {
    if (!q) return `/users`;
    const sp = new URLSearchParams();
    if (typeof q.query === "string" && q.query.length > 0) sp.set("query", q.query);
    if (typeof q.role === "string") sp.set("role", q.role);
    if (typeof q.active === "boolean") sp.set("active", String(q.active));
    const qs = sp.toString();
    return qs.length ? `/users?${qs}` : `/users`;
  },
  detail: (id: string) => `/users/${id}`,
  create: () => `/users`,
  update: (id: string) => `/users/${id}`,
  destroy: (id: string) => `/users/${id}`
} as const;
