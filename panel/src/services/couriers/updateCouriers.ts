import { couriersEndpoints } from './endpoints';
import type { Courier, CourierInput } from './types';
import { apiFetch } from "@/app/lib/api";

export async function updateCourier(id: string, input: Partial<CourierInput>): Promise<Courier> {
  // Ensure active boolean is always sent if present; default to false only if explicitly false
  const payload: Partial<CourierInput> =
    typeof input.active === "boolean" ? { ...input, active: input.active } : { ...input };
  return apiFetch<Courier>(couriersEndpoints.update(id), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courier: payload })
  });
}
