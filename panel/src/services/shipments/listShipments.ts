import { apiFetch } from "@/app/lib/api";
import { shipmentsEndpoints } from "./endpoints";
import type { Shipment, ShipmentsFilter } from "./types";

export async function listShipments(params: ShipmentsFilter = {}): Promise<Shipment[]> {
  const sp = new URLSearchParams();
  if (params.status) sp.set("status", params.status);
  if (params.courier_id) sp.set("courier_id", params.courier_id);
  if (params.date) sp.set("date", params.date);
  return apiFetch<Shipment[]>(shipmentsEndpoints.list(sp.toString()));
}


