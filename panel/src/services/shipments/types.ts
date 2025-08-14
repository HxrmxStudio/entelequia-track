export interface Shipment {
  id: string;
  order_id: string;
  status: ShipmentStatus;
  delivery_method: DeliveryMethod;
  qr_token: string;
  eta?: string | null;
}

export interface ShipmentEvent {
  id: string;
  type_key: string;
  subject_id: string;
  occurred_at: string;
  payload: unknown;
}

export interface ShipmentWithEvents extends Shipment {
  events: ShipmentEvent[];
}

export interface ShipmentsFilter {
  status?: ShipmentStatus;
  courier_id?: string;
  date?: "today";
  delivery_method?: DeliveryMethod;
}

export interface ListResponse<T> {
  data: T[];
  meta?: Record<string, unknown>;
}

export type ShipmentStatus = "queued" | "out_for_delivery" | "delivered" | "failed" | "canceled";

export type DeliveryMethod = "courier" | "pickup" | "carrier" | "other";

export interface UpdateShipmentPayload {
  shipment: {
    status?: ShipmentStatus;
    delivery_method?: DeliveryMethod;
    eta?: string | null;
    geofence_radius_m?: number; // > 0 if provided
    // Intentionally NO otp_attempts here (server-managed)
  };
}
  