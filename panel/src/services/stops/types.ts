export type StopStatus = "pending" | "in_progress" | "completed" | "failed" | string;

export interface StopItem {
  id: string;
  route_id: string;
  shipment_id?: string | null;
  sequence: number;
  status: StopStatus;
  eta?: string | null;
  lat?: number | null;
  lon?: number | null;
  address?: string | null;
  completed_at?: string | null;
  failed_at?: string | null;
  fail_reason?: string | null;
}

export interface CreateStopPayload {
  stop: {
    shipment_id?: string | null;
    eta?: string | null;
    lat?: number | null;
    lon?: number | null;
    address?: string | null;
    sequence?: number | null;
  };
}

export interface UpdateStopPayload {
  stop: Partial<NonNullable<CreateStopPayload["stop"]>>;
}

export interface ResequencePayload {
  order: string[]; // array of stop ids in desired order
}

export interface FailStopPayload {
  reason: string;
}


