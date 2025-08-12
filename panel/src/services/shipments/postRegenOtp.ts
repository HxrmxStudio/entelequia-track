import { API_URL, authHeaders } from "@/app/lib/api";
import { shipmentsEndpoints } from "./endpoints";

export async function postRegenOtp(id: string): Promise<{ ok?: boolean } | Record<string, unknown>> {
  const headers = authHeaders();
  const res = await fetch(`${API_URL}${shipmentsEndpoints.regenOtp(id)}`, { method: "POST", headers });
  const text = await res.text();
  if (!res.ok) throw new Error(text || `Request failed ${res.status}`);
  return text ? (JSON.parse(text) as { ok?: boolean }) : {};
}


