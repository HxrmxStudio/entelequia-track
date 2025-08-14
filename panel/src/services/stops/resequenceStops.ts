import { apiFetch } from "@/app/lib/api";
import { stopsEndpoints } from "./endpoints";
import type { ResequencePayload, StopItem } from "./types";

export async function resequenceStops(routeId: string, payload: ResequencePayload): Promise<StopItem[]> {
  return apiFetch<StopItem[]>(stopsEndpoints.resequence(routeId), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}


