import { apiFetch } from "@/app/lib/api";
import { alertsEndpoints } from "./endpoints";
import type { AlertListResponse } from "./types";

export async function countOpenAlerts(): Promise<number> {
  // TEMPORARILY DISABLED: Authentication issues with alerts request
  // const list = await apiFetch<AlertListResponse>(alertsEndpoints.list({ status: "open" }));
  // return list.length;

  // Return mock value for testing
  console.log("[ALERTS] Temporarily disabled - returning mock count");
  return 0;
}