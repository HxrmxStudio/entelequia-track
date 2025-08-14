import { apiFetch } from "@/app/lib/api";
import { routesEndpoints } from "./endpoints";
import type { RouteItem, UpdateRoutePayload } from "./types";

export async function updateRoute(id: string, payload: UpdateRoutePayload): Promise<RouteItem> {
  return apiFetch<RouteItem>(routesEndpoints.update(id), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}


