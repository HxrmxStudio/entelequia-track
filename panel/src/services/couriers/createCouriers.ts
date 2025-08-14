import { couriersEndpoints } from './endpoints';
import type { Courier, CourierInput } from './types';
import { apiFetch } from "@/app/lib/api";

export async function createCourier(input: CourierInput): Promise<Courier> {
  const payload: CourierInput = { ...input, active: Boolean(input.active) };
  return apiFetch<Courier>(couriersEndpoints.create(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courier: payload })
  });
}
