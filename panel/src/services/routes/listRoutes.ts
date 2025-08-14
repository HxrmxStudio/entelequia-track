import { apiFetch } from "@/app/lib/api";
import { routesEndpoints } from "./endpoints";
import type { RouteItem, RoutesFilter } from "./types";

export async function listRoutes(params: RoutesFilter = {}): Promise<RouteItem[]> {
  const sp = new URLSearchParams();
  if (params.date) sp.set("date", params.date);
  if (params.courier_id) sp.set("courier_id", params.courier_id);
  if (params.status) sp.set("status", String(params.status));
  return apiFetch<RouteItem[]>(routesEndpoints.list(sp.toString()));
}


