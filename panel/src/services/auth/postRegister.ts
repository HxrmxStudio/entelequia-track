import { API_URL } from "@/app/lib/api";
import { authEndpoints } from "./endpoints";
import type { RegisterRequest, RegisterResponse } from "./types";

export async function postRegister(payload: RegisterRequest): Promise<RegisterResponse> {
  const res = await fetch(`${API_URL}${authEndpoints.register()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || `Request failed ${res.status}`);
  return JSON.parse(text) as RegisterResponse;
}
