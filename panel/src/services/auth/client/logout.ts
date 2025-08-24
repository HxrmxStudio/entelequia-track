import { authEndpoints } from "../endpoints";
import { useAuthStore } from "@/stores/auth";

/**
 * Client-side logout function
 * Cookie clearing is handled entirely server-side via the Next.js proxy
 * This ensures secure removal of HttpOnly refresh tokens
 */
export async function logout(): Promise<void> {
  try {
    // Use Next.js proxy instead of direct backend access
    // This ensures cookies are properly handled and forwarded
    const res = await fetch(authEndpoints.logout(), {
      method: "POST",
      credentials: "include", // Important: include cookies
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
