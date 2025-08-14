import { apiFetch } from "@/app/lib/api";
import { routesEndpoints } from "./endpoints";
import type { RouteItem } from "./types";

export async function startRoute(id: string): Promise<RouteItem> {
  return apiFetch<RouteItem>(routesEndpoints.start(id), { method: "PATCH" });
}


