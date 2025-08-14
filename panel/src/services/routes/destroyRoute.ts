import { apiFetch } from "@/app/lib/api";
import { routesEndpoints } from "./endpoints";

export async function destroyRoute(id: string): Promise<void> {
  await apiFetch<void>(routesEndpoints.destroy(id), { method: "DELETE" });
}


