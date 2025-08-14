import { API_BASE_URL, alertsEndpoints } from "./endpoints";
import type { AlertListResponse } from "./types";

export async function countOpenAlerts(baseUrl: string = API_BASE_URL): Promise<number> {
  const res = await fetch(`${baseUrl}${alertsEndpoints.list({ status: "open" })}`, { credentials: "include" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  const list = (await res.json()) as AlertListResponse;
  return list.length;
}