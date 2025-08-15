import { API_URL } from "@/app/lib/api";
import { authEndpoints } from "./endpoints";
import { RefreshResponse } from "./types";

export async function refreshToken(): Promise<RefreshResponse> {
  const res = await fetch(`${API_URL}${authEndpoints.refresh()}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  });
  
  const text = await res.text();
  if (!res.ok) throw new Error(text || `Request failed ${res.status}`);
  return JSON.parse(text) as RefreshResponse;
}
