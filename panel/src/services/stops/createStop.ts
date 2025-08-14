import { apiFetch } from "@/app/lib/api";
import { stopsEndpoints } from "./endpoints";
import type { CreateStopPayload, StopItem } from "./types";

export async function createStop(routeId: string, payload: CreateStopPayload): Promise<StopItem> {
  return apiFetch<StopItem>(stopsEndpoints.create(routeId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}


