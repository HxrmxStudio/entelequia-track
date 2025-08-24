import { authEndpoints } from "../endpoints";
import { RegisterRequest, RegisterResponse, ServerLoginResponse } from "../types";
import { useAuthStore } from "@/stores/auth";

/**
 * Client-side registration function
 * Handles authentication via HttpOnly cookies - no client-side token storage
 * @param payload Registration data
 * @returns Promise containing only user data (access tokens handled server-side)
 */
export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  
  const res = await fetch(`${API_URL}${authEndpoints.register()}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  
  const text = await res.text();
  if (!res.ok) throw new Error(text || `Request failed ${res.status}`);
  
  // Backend returns full response with access_token, but client only needs user data
  const serverResponse = JSON.parse(text) as ServerLoginResponse;
  
  // Update auth store with user data (access tokens handled server-side via cookies)
  useAuthStore.getState().setAuth(serverResponse.user);
  
  // Return client-safe response without tokens
  return { user: serverResponse.user };
}
