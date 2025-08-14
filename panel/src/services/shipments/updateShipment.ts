import { apiFetch } from "@/app/lib/api";
import { shipmentsEndpoints } from "./endpoints";
import type { DeliveryMethod, Shipment, UpdateShipmentPayload } from "./types";

function assertDeliveryMethod(method: unknown): asserts method is DeliveryMethod {
  const allowed: DeliveryMethod[] = ["courier", "pickup", "carrier", "other"];
  if (typeof method !== "string" || !allowed.includes(method as DeliveryMethod)) {
    throw new Error("delivery_method must be one of courier|pickup|carrier|other");
  }
}

export async function updateShipment(id: string, payload: UpdateShipmentPayload): Promise<Shipment> {
  const body: UpdateShipmentPayload = { shipment: { ...payload.shipment } };
  if (body.shipment.delivery_method) {
    assertDeliveryMethod(body.shipment.delivery_method);
  }
  if (typeof body.shipment.geofence_radius_m === "number") {
    if (!(body.shipment.geofence_radius_m > 0)) {
      throw new Error("geofence_radius_m must be greater than 0");
    }
  }
  // Never include otp_attempts even if present by mistake

  delete (body.shipment as never)["otp_attempts"];

  return apiFetch<Shipment>(shipmentsEndpoints.update(id), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}


