import { API_URL } from "@/app/lib/api";
import { authEndpoints } from "./endpoints";
import { LoginRequest, LoginResponse } from "./types";

export async function postLogin(payload: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}${authEndpoints.login()}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || `Request failed ${res.status}`);
  return JSON.parse(text) as LoginResponse;
}


