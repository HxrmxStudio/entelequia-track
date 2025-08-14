import { apiFetch } from "@/app/lib/api";
import { stopsEndpoints } from "./endpoints";
import type { StopItem } from "./types";

export async function listStops(routeId: string): Promise<StopItem[]> {
  return apiFetch<StopItem[]>(stopsEndpoints.list(routeId));
}


