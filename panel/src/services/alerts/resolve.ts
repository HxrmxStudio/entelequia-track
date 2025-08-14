import { API_BASE_URL, alertsEndpoints } from "./endpoints";
import type { ResolveAlertPayload, ResolveAlertResponse } from "./types";

export async function resolveAlert(id: number | string, note?: string, baseUrl: string = API_BASE_URL): Promise<ResolveAlertResponse> {
  const payload: ResolveAlertPayload = { note };
  const res = await fetch(`${baseUrl}${alertsEndpoints.resolve(id)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<ResolveAlertResponse>;
}


