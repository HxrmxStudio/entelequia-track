import { useAuthStore } from "@/stores/auth";

/**
 * Checks if user is authenticated (CLIENT-SIDE ONLY)
 * 
 * This function only checks local authentication state, not actual token validity.
 * Real authentication is handled server-side via HttpOnly cookies.
 * 
 * @returns boolean indicating if user appears authenticated locally
 */
export function isAuthenticated(): boolean {
  try {
    const { isAuthenticated: storeAuth, isLoading } = useAuthStore.getState();
    
    // If still loading, consider not authenticated for safety
    if (isLoading) {
      return false;
    }
    
    return storeAuth;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
}

// Function to get current user data from store
export function getCurrentUser() {
  const { user } = useAuthStore.getState();
  return user;
}

// Function to check if auth is still loading
export function isAuthLoading(): boolean {
  const { isLoading } = useAuthStore.getState();
  return isLoading;
}

/**
 * Gets headers for API calls (NO AUTHORIZATION TOKENS)
 * 
 * Returns basic headers without authorization since authentication
 * is handled server-side via HttpOnly cookies and the proxy layer.
 * 
 * @returns Basic headers object without any authorization tokens
 */
export function getAuthHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json"
  };
}

// Legacy function - kept for compatibility but always returns false since we use cookies
export function isTokenExpired(): boolean {
  return false;
}

// Legacy function - kept for compatibility but always returns null since we use cookies
export function getTimeUntilExpiration(): number | null {
  return null;
}

// Legacy function - kept for compatibility but always returns false since we use cookies
export function shouldRefreshToken(): boolean {
  return false;
}
