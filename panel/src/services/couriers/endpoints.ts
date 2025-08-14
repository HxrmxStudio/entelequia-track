export const couriersEndpoints = {
    list: (q?: { query?: string; active?: boolean }) =>
      `/api/v1/couriers${q ? `?${new URLSearchParams(
        Object.entries(q).filter(([,v]) => v !== undefined && v !== null).map(([k,v])=>[k,String(v)])
      )}` : ''}`,
    detail: (id: string) => `/api/v1/couriers/${id}`,
    create: `/api/v1/couriers`,
    update: (id: string) => `/api/v1/couriers/${id}`,
    destroy: (id: string) => `/api/v1/couriers/${id}`,
  };
  