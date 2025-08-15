import { useAuthStore } from "@/stores/auth";
import { refreshToken } from "./refresh";

// Refresh token 5 minutes before expiration
const REFRESH_BUFFER_MINUTES = 5;

class TokenManager {
  private refreshTimer: NodeJS.Timeout | null = null;

  // Initialize token validation and auto-refresh
  initialize() {
    this.validateStoredToken();
    this.scheduleNextRefresh();
  }

  // Validate stored token on app startup
  private validateStoredToken() {
    const { accessToken, tokenExpiration, isAuthenticated } = useAuthStore.getState();
    
    if (!isAuthenticated || !accessToken || !tokenExpiration) {
      return;
    }

    // Check if token is already expired
    if (this.isTokenExpired(tokenExpiration)) {
      console.log("Stored token is expired, attempting refresh...");
      this.refreshTokenIfNeeded();
    }
  }

  // Schedule next token refresh
  private scheduleNextRefresh() {
    const { tokenExpiration } = useAuthStore.getState();
    
    if (!tokenExpiration) {
      return;
    }

    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Calculate time until refresh (5 minutes before expiration)
    const now = Math.floor(Date.now() / 1000);
    const refreshTime = tokenExpiration - (REFRESH_BUFFER_MINUTES * 60);
    const timeUntilRefresh = (refreshTime - now) * 1000; // Convert to milliseconds

    if (timeUntilRefresh > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshTokenIfNeeded();
      }, timeUntilRefresh);
    } else {
      // Token expires soon, refresh immediately
      this.refreshTokenIfNeeded();
    }
  }

  // Check if token is expired
  private isTokenExpired(exp: number): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= exp;
  }

  // Refresh token if needed
  private async refreshTokenIfNeeded() {
    try {
      console.log("Refreshing access token...");
      const response = await refreshToken();
      
      // Update store with new token
      useAuthStore.getState().updateAccessToken(response.access_token, response.exp);
      
      // Schedule next refresh
      this.scheduleNextRefresh();
      
      console.log("Token refreshed successfully");
    } catch (error) {
      console.error("Failed to refresh token:", error);
      
      // If refresh fails, clear auth and redirect to login
      useAuthStore.getState().clearAuth();
      
      // Redirect to login (only if we're not already there)
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
  }

  // Clean up timers
  cleanup() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // Force refresh (useful for manual refresh)
  async forceRefresh(): Promise<boolean> {
    try {
      await this.refreshTokenIfNeeded();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const tokenManager = new TokenManager();
