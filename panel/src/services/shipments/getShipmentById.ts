import { apiFetch } from "@/app/lib/api";
import { shipmentsEndpoints } from "./endpoints";
import type { ShipmentWithEvents } from "./types";

export async function getShipmentById(id: string): Promise<ShipmentWithEvents> {
  return apiFetch<ShipmentWithEvents>(shipmentsEndpoints.get(id));
}


