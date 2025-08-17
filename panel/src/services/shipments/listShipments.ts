import { apiFetch } from "@/app/lib/api";
import { buildQueryString } from "@/lib/queryBuilder";
import { shipmentsEndpoints } from "./endpoints";
import type { Shipment, ShipmentsFilter } from "./types";

export async function listShipments(params: ShipmentsFilter = {}): Promise<Shipment[]> {
  // Cast to compatible type for query builder
  const queryParams = params as Record<string, string | number | boolean | null | undefined>;
  const queryString = buildQueryString(queryParams);
  return apiFetch<Shipment[]>(shipmentsEndpoints.list(queryString));
}


