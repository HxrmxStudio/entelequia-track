import { apiFetch } from "@/app/lib/api";
import { shipmentsEndpoints } from "./endpoints";
import type { Shipment } from "./types";

export async function postAssignShipment(id: string, courier_id: string): Promise<Shipment> {
  return apiFetch<Shipment>(shipmentsEndpoints.assign(id), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courier_id })
  });
}


