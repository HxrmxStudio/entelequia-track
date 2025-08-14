// Types mirror backend serializer in Api::V1::AlertsController#serialize
export interface AlertResourceRef {
  type: "Courier" | "Shipment" | "Route" | "Unknown" | string;
  id: number | string | null;
}

export interface Alert {
  id: number;
  type: string; // backend exposes code as "type"
  status: "open" | "resolved";
  resource: AlertResourceRef;
  payload: Record<string, unknown> & {
    delay_min?: number;
    eta?: string;
  };
  created_at: string | null;
  resolved_at: string | null;
}

export interface AlertFilters {
  status?: "open" | "resolved";
  type?: string;
  resource_type?: "Courier" | "Shipment" | "Route";
  resource_id?: number | string;
  since?: string; // ISO8601
  limit?: number; // max 500
}

export type AlertListResponse = Alert[];

export interface ResolveAlertPayload {
  note?: string;
}

export type ResolveAlertResponse = Alert;

export interface RealtimeAlertCreatedEvent {
  type: "alert.created" | string;
  data: Alert;
}

export interface RealtimeAlertResolvedEvent {
  type: "alert.resolved" | string;
  data: { id: number | string; type: string; resolved_at: string };
}
  