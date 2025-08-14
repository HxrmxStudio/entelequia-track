import type { AlertFilters } from "./types";

export const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_URL ?? "";

function buildQueryString(params?: AlertFilters): string {
  if (!params) return "";
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.type) qs.set("type", params.type);
  if (params.resource_type) qs.set("resource_type", params.resource_type);
  if (params.resource_id !== undefined && params.resource_id !== null) {
    qs.set("resource_id", String(params.resource_id));
  }
  if (params.since) qs.set("since", params.since);
  if (params.limit !== undefined) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return query ? `?${query}` : "";
}

export const alertsEndpoints = {
  list: (params?: AlertFilters) => `/api/v1/alerts${buildQueryString(params)}`,
  resolve: (id: string | number) => `/api/v1/alerts/${id}/resolve`,
};
  