import { apiFetch } from "@/app/lib/api";
import { stopsEndpoints } from "./endpoints";

export async function destroyStop(routeId: string, id: string): Promise<void> {
  await apiFetch<void>(stopsEndpoints.destroy(routeId, id), { method: "DELETE" });
}


