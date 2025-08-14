import { apiFetch } from "@/app/lib/api";
import { stopsEndpoints } from "./endpoints";
import type { ResequencePayload, StopItem } from "./types";

function assertUniqueAndNonNegative(order: string[]): void {
  const seen = new Set<string>();
  for (const id of order) {
    if (seen.has(id)) throw new Error("Duplicate stop id in order");
    seen.add(id);
  }
  // sequences are assigned server-side to 1..N; client ensures we send exact route ids only
}

export async function resequenceStops(routeId: string, payload: ResequencePayload): Promise<StopItem[]> {
  if (!Array.isArray(payload.order) || payload.order.length === 0) {
    throw new Error("order must be a non-empty array of stop ids");
  }
  assertUniqueAndNonNegative(payload.order);
  return apiFetch<StopItem[]>(stopsEndpoints.resequence(routeId), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}


