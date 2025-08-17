import { buildUrlWithQuery } from "@/lib/queryBuilder";
import type { AlertFilters } from "./types";

export const alertsEndpoints = {
  list: (params?: AlertFilters) => buildUrlWithQuery("/api/v1/alerts", params as Record<string, string | number | boolean | null | undefined>),
  resolve: (id: string | number) => `/api/v1/alerts/${id}/resolve`,
};
  