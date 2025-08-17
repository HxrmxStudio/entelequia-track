import { apiFetch } from "@/app/lib/api";
import { alertsEndpoints } from "./endpoints";
import type { ResolveAlertPayload, ResolveAlertResponse } from "./types";

export async function resolveAlert(id: number | string, note?: string): Promise<ResolveAlertResponse> {
  const payload: ResolveAlertPayload = { note };
  return apiFetch<ResolveAlertResponse>(alertsEndpoints.resolve(id), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}


