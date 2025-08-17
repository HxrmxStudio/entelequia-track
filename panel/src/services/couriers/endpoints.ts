import { buildUrlWithQuery } from "@/lib/queryBuilder";

export type ListCouriersQuery = { query?: string; active?: boolean };

export const couriersEndpoints = {
  list: (q?: ListCouriersQuery) => buildUrlWithQuery("/couriers", q as Record<string, string | number | boolean | null | undefined>),
  detail: (id: string) => `/couriers/${id}`,
  create: () => `/couriers`,
  update: (id: string) => `/couriers/${id}`,
  destroy: (id: string) => `/couriers/${id}`
} as const;
  