import { apiFetch } from "@/app/lib/api";
import { stopsEndpoints } from "./endpoints";
import type { FailStopPayload, StopItem } from "./types";

export async function failStop(routeId: string, id: string, payload: FailStopPayload): Promise<StopItem> {
  return apiFetch<StopItem>(stopsEndpoints.fail(routeId, id), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}


