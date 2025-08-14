import { API_BASE_URL, alertsEndpoints } from "./endpoints";
import type { AlertListResponse, AlertFilters } from "./types";

export async function listAlerts(filters?: AlertFilters, baseUrl: string = API_BASE_URL): Promise<AlertListResponse> {
  const res = await fetch(`${baseUrl}${alertsEndpoints.list(filters)}`, { credentials: "include" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<AlertListResponse>;
}


