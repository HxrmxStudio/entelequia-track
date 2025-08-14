export const stopsEndpoints = {
  list: (routeId: string) => `/api/v1/routes/${routeId}/stops`,
  get: (routeId: string, id: string) => `/api/v1/routes/${routeId}/stops/${id}`,
  create: (routeId: string) => `/api/v1/routes/${routeId}/stops`,
  update: (routeId: string, id: string) => `/api/v1/routes/${routeId}/stops/${id}`,
  destroy: (routeId: string, id: string) => `/api/v1/routes/${routeId}/stops/${id}`,
  resequence: (routeId: string) => `/api/v1/routes/${routeId}/stops/resequence`,
  complete: (routeId: string, id: string) => `/api/v1/routes/${routeId}/stops/${id}/complete`,
  fail: (routeId: string, id: string) => `/api/v1/routes/${routeId}/stops/${id}/fail`
} as const;


