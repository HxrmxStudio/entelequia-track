export const ordersEndpoints = {
  list: (q?: string) => q && q.length > 0 ? `/orders?${q}` : `/orders`,
  get: (id: string) => `/orders/${id}`
} as const;
