export type ListCouriersQuery = { query?: string; active?: boolean };

export const couriersEndpoints = {
  list: (q?: ListCouriersQuery) => {
    if (!q) return `/couriers`;
    const sp = new URLSearchParams();
    if (typeof q.query === "string" && q.query.length > 0) sp.set("query", q.query);
    if (typeof q.active === "boolean") sp.set("active", String(q.active));
    const qs = sp.toString();
    return qs.length ? `/couriers?${qs}` : `/couriers`;
  },
  detail: (id: string) => `/couriers/${id}`,
  create: () => `/couriers`,
  update: (id: string) => `/couriers/${id}`,
  destroy: (id: string) => `/couriers/${id}`
} as const;
  