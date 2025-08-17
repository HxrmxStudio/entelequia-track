import { API_URL } from "@/app/lib/api";
import { authEndpoints } from "./endpoints";
import type { RegisterRequest, RegisterResponse } from "./types";
import { useAuthStore } from "@/stores/auth";

export async function postRegister(payload: RegisterRequest): Promise<RegisterResponse> {
  const res = await fetch(`${API_URL}${authEndpoints.register()}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  
  const text = await res.text();
  if (!res.ok) throw new Error(text || `Request failed ${res.status}`);
  
  const registerResponse = JSON.parse(text) as RegisterResponse;
  
  // Update auth store with user data (no token storage needed)
  useAuthStore.getState().setAuth(registerResponse.user);
  
  return registerResponse;
}
