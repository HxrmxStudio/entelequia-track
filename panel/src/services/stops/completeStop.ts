import { apiFetch } from "@/app/lib/api";
import { stopsEndpoints } from "./endpoints";
import type { StopItem } from "./types";

export async function completeStop(routeId: string, id: string): Promise<StopItem> {
  return apiFetch<StopItem>(stopsEndpoints.complete(routeId, id), { method: "PATCH" });
}


