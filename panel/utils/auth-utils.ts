import { useAuthStore } from "@/stores/auth";

// Function to check if user is authenticated
export function isAuthenticated(): boolean {
  try {
    const { accessToken, isAuthenticated: storeAuth, tokenExpiration } = useAuthStore.getState();
    
    console.log("Auth check:", { accessToken: !!accessToken, storeAuth, tokenExpiration });
    
    // Check store state first
    if (!storeAuth || !accessToken) {
      console.log("Auth failed: missing store state or token");
      return false;
    }
    
    // Check if token is expired
    if (tokenExpiration && isTokenExpired(tokenExpiration)) {
      console.log("Token is expired, clearing auth state");
      useAuthStore.getState().clearAuth();
      return false;
    }
    
    console.log("Auth successful");
    return true;
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

// Function to check if token is expired (if we have expiration time)
export function isTokenExpired(exp?: number): boolean {
  if (!exp) return false;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime >= exp;
}

// Function to get auth headers for API calls
export function getAuthHeaders(): Record<string, string> {
  const { accessToken } = useAuthStore.getState();
  
  if (!accessToken) {
    return {};
  }
  
  return {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json"
  };
}

// Function to get time until token expires (in seconds)
export function getTimeUntilExpiration(): number | null {
  const { tokenExpiration } = useAuthStore.getState();
  
  if (!tokenExpiration) {
    return null;
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  return Math.max(0, tokenExpiration - currentTime);
}

// Function to check if token needs refresh soon (within 5 minutes)
export function shouldRefreshToken(): boolean {
  const timeUntilExpiration = getTimeUntilExpiration();
  
  if (timeUntilExpiration === null) {
    return false;
  }
  
  // Refresh if token expires within 5 minutes
  return timeUntilExpiration <= 300; // 5 minutes = 300 seconds
}
