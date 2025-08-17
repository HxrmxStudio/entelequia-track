import { apiFetch } from "@/app/lib/api";
import { buildQueryString } from "@/lib/queryBuilder";
import { routesEndpoints } from "./endpoints";
import type { RouteItem, RoutesFilter } from "./types";

export async function listRoutes(params: RoutesFilter = {}): Promise<RouteItem[]> {
  // Cast to compatible type for query builder
  const queryParams = params as Record<string, string | number | boolean | null | undefined>;
  const queryString = buildQueryString(queryParams);
  return apiFetch<RouteItem[]>(routesEndpoints.list(queryString));
}


