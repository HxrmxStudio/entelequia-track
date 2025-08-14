import { apiFetch } from "@/app/lib/api";
import { routesEndpoints } from "./endpoints";
import type { RouteItem } from "./types";

export async function completeRoute(id: string): Promise<RouteItem> {
  return apiFetch<RouteItem>(routesEndpoints.complete(id), { method: "PATCH" });
}


