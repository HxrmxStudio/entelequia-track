import { API_URL } from "@/app/lib/api";
import { authEndpoints } from "./endpoints";
import { LoginRequest, LoginResponse } from "./types";
import { useAuthStore } from "@/stores/auth";

export async function postLogin(payload: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}${authEndpoints.login()}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  
  const text = await res.text();
  if (!res.ok) throw new Error(text || `Request failed ${res.status}`);
  
  const loginResponse = JSON.parse(text) as LoginResponse;
  
  // Update auth store with user data (no token storage needed)
  useAuthStore.getState().setAuth(loginResponse.user);
  
  return loginResponse;
}


