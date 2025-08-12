import { API_URL, authHeaders } from "@/app/lib/api";
import { shipmentsEndpoints } from "./endpoints";
import type { Shipment } from "./types";

export async function postAssignShipment(id: string, courier_id: string): Promise<Shipment> {
  const headers = authHeaders({ "Content-Type": "application/json" });
  const res = await fetch(`${API_URL}${shipmentsEndpoints.assign(id)}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ courier_id })
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || `Request failed ${res.status}`);
  return (text ? JSON.parse(text) : {}) as Shipment;
}


