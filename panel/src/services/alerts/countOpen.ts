import { apiFetch } from "@/app/lib/api";
import { alertsEndpoints } from "./endpoints";
import type { AlertListResponse } from "./types";

export async function countOpenAlerts(): Promise<number> {
  const list = await apiFetch<AlertListResponse>(alertsEndpoints.list({ status: "open" }));
  return list.length;
}