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
    // This will also clean up the token manager
    useAuthStore.getState().clearAuth();
  }
}
