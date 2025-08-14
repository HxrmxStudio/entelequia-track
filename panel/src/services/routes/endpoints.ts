export const routesEndpoints = {
  list: (q?: string) => (q && q.length > 0 ? `/api/v1/routes?${q}` : `/api/v1/routes`),
  get: (id: string) => `/api/v1/routes/${id}`,
  create: () => `/api/v1/routes`,
  update: (id: string) => `/api/v1/routes/${id}`,
  destroy: (id: string) => `/api/v1/routes/${id}`,
  assignCourier: (id: string) => `/api/v1/routes/${id}/assign_courier`,
  start: (id: string) => `/api/v1/routes/${id}/start`,
  complete: (id: string) => `/api/v1/routes/${id}/complete`
} as const;


