import { endpoints } from "@/services/http";
import { useAuthStore } from "@/stores/auth";

export async function sendLocationPing(payload: {
  lat: number;
  lon: number;
  ts: string;
  accuracy?: number;
  speed?: number;
}): Promise<void> {
  const courierId = useAuthStore.getState().userId;
  if (!courierId) return;
  await endpoints.locationPing({ courier_id: courierId, ...payload });
}


