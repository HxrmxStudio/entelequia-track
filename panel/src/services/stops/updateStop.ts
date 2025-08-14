import { apiFetch } from "@/app/lib/api";
import { stopsEndpoints } from "./endpoints";
import type { StopItem, UpdateStopPayload } from "./types";

export async function updateStop(routeId: string, id: string, payload: UpdateStopPayload): Promise<StopItem> {
  return apiFetch<StopItem>(stopsEndpoints.update(routeId, id), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}


