export interface PublicTrack {
  shipment: { id: string; status: string; eta?: string | null; order_id: string };
  destination?: { line1: string; city?: string; province?: string; postal_code?: string; lat?: number; lon?: number };
  courier_last?: { lat: number; lon: number; recorded_at: string };
}


