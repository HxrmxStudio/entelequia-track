import { useAuthStore } from "@/stores/auth";

// Function to check if user is authenticated (client-side only)
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

// Function to get auth headers for API calls
// Note: This now uses server-side refresh tokens, so no Authorization header needed for most calls
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
