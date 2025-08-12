import { apiFetch } from "@/app/lib/api";
import { shipmentsEndpoints } from "./endpoints";
import type { Shipment, ShipmentsFilter } from "./types";

export async function listShipments(params: ShipmentsFilter = {}): Promise<Shipment[]> {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<Shipment[]>(shipmentsEndpoints.list(q));
}


