import { apiFetch } from "@/app/lib/api";
import { routesEndpoints } from "./endpoints";
import type { CreateRoutePayload, RouteItem } from "./types";

export async function createRoute(payload: CreateRoutePayload): Promise<RouteItem> {
  return apiFetch<RouteItem>(routesEndpoints.create(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}


