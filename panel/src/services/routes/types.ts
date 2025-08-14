export type RouteStatus = "planned" | "in_progress" | "completed";

export interface RouteCourier {
  id: string;
  name: string;
}

export interface RouteStopCompact {
  id: string;
  sequence: number;
  status: string;
  eta?: string | null;
  lat?: number | null;
  lon?: number | null;
  address?: string | null;
  shipment_id?: string | null;
}

export interface RouteItem {
  id: string;
  name?: string | null;
  scheduled_date?: string | null; // date-only (YYYY-MM-DD) from backend .to_date
  status: RouteStatus | string;
  started_at?: string | null;
  completed_at?: string | null;
  courier?: RouteCourier | null;
  stops: RouteStopCompact[];
}

export interface RoutesFilter {
  date?: string; // YYYY-MM-DD
  courier_id?: string;
  status?: RouteStatus | string;
}

export interface CreateRoutePayload {
  route: {
    name?: string | null;
    scheduled_date?: string | null;
    courier_id?: string | null;
    status?: RouteStatus | string | null;
  };
}

export interface UpdateRoutePayload {
  route: Partial<NonNullable<CreateRoutePayload["route"]>>;
}

export interface AssignCourierPayload {
  courier_id: string;
}


