/**
 * Authentication utilities
 * Separated by client/server context for better organization
 */

// Client-side utilities (browser only)
export {
  isAuthenticated,
  getCurrentUser,
  isAuthLoading,
  getAuthHeaders,
  isTokenExpired,
  getTimeUntilExpiration,
  shouldRefreshToken,
} from "./client";

// Server-side utilities (server/middleware only)
export {
  isLikelyAuthenticated,
  extractUserFromCookies,
  getAuthConfidence,
  shouldAllowOptimistically,
} from "./server";
