import { apiFetch } from "@/app/lib/api";
import { alertsEndpoints } from "./endpoints";
import type { AlertListResponse, AlertFilters } from "./types";

export async function listAlerts(filters?: AlertFilters): Promise<AlertListResponse> {
  return apiFetch<AlertListResponse>(alertsEndpoints.list(filters));
}


