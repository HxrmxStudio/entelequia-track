import { apiFetch } from "@/app/lib/api";
import { shipmentsEndpoints } from "./endpoints";

export async function postRegenOtp(id: string): Promise<{ ok?: boolean } | Record<string, unknown>> {
  return apiFetch<{ ok?: boolean } | Record<string, unknown>>(shipmentsEndpoints.regenOtp(id), { 
    method: "POST" 
  });
}


