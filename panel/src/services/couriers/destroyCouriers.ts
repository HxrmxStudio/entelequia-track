import { couriersEndpoints } from './endpoints';
import { apiFetch } from "@/app/lib/api";

export async function destroyCourier(id: string): Promise<void> {
  await apiFetch<void>(couriersEndpoints.destroy(id), { method: "DELETE" });
}
