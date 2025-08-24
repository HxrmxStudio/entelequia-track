import { authEndpoints } from "../endpoints";
import { LoginRequest, LoginResponse, ServerLoginResponse } from "../types";
import { useAuthStore } from "@/stores/auth";

/**
 * Client-side login function
 * Handles authentication via HttpOnly cookies through Next.js proxy
 * @param payload Login credentials
 * @returns Promise containing only user data (access tokens handled server-side)
 */
export async function login(payload: LoginRequest): Promise<LoginResponse> {
  // Use Next.js proxy instead of direct backend access
  // This ensures cookies are properly handled and forwarded
  const res = await fetch(authEndpoints.login(), {
    method: "POST",
    credentials: "include", // Important: include cookies
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
