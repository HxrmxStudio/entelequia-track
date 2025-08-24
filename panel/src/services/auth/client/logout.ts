import { authEndpoints } from "../endpoints";
import { useAuthStore } from "@/stores/auth";

/**
 * Client-side logout function
 * Cookie clearing is handled entirely server-side via the logout endpoint
 * This ensures secure removal of HttpOnly refresh tokens
 */
export async function logout(): Promise<void> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  
  try {
    // Call backend logout endpoint - this handles all cookie clearing server-side
    const res = await fetch(`${API_URL}${authEndpoints.logout()}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    
    if (!res.ok) {
      const text = await res.text();
      console.warn("Logout request failed:", text);
    }
  } catch (error) {
    console.error("Error during logout:", error);
  } finally {
    // Always clear local auth state, even if backend call fails
    useAuthStore.getState().clearAuth();
    
    // Server handles all cookie clearing - no client-side manipulation needed
    // This is more secure for HttpOnly cookies which can't be accessed via JS anyway
    
    // Redirect to login page
    window.location.href = "/login";
  }
}
