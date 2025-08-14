import { apiFetch } from "@/app/lib/api";
import { routesEndpoints } from "./endpoints";
import type { AssignCourierPayload, RouteItem } from "./types";

export async function assignCourierToRoute(id: string, payload: AssignCourierPayload): Promise<RouteItem> {
  return apiFetch<RouteItem>(routesEndpoints.assignCourier(id), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}


