import { couriersEndpoints } from './endpoints';
import type { Courier, CourierInput } from './types';
import { apiFetch } from "@/app/lib/api";

export async function updateCourier(id: string, input: Partial<CourierInput>): Promise<Courier> {
  return apiFetch<Courier>(couriersEndpoints.update(id), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courier: input })
  });
}
