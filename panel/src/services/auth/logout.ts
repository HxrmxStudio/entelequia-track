import { API_URL } from "@/app/lib/api";
import { authEndpoints } from "./endpoints";
import { useAuthStore } from "@/stores/auth";

export async function logout(): Promise<void> {
  try {
    // Call backend logout endpoint
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
    
    // Clear all cookies by setting them to expire in the past
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    
    // Redirect to login page
    window.location.href = "/login";
  }
}
