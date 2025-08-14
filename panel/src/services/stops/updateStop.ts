import { apiFetch } from "@/app/lib/api";
import { stopsEndpoints } from "./endpoints";
import type { StopItem, UpdateStopPayload } from "./types";

export async function updateStop(routeId: string, id: string, payload: UpdateStopPayload): Promise<StopItem> {
  // Guard sequence if provided: integer >= 0
  if (payload.stop && typeof payload.stop.sequence !== "undefined") {
    const seq = payload.stop.sequence;
    if (seq !== null && (!Number.isInteger(seq) || seq < 0)) {
      throw new Error("sequence must be a non-negative integer");
    }
  }
  return apiFetch<StopItem>(stopsEndpoints.update(routeId, id), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}


