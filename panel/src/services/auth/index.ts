/**
 * Centralized Authentication Module
 * 
 * This module consolidates all authentication logic following NextJS best practices
 * and DRY, KISS, SRP principles. All auth-related functionality is organized here.
 */

// Types
export type * from "./types";

// API Endpoints
export { authEndpoints } from "./endpoints";

// Client-side functions (browser only)
export {
  login,
  register,
  logout,
} from "./client";

// Server-side functions (server/API routes only)
export {
  validateSession,
  handleSessionRequest,
  refreshAccessToken,
  handleRefreshRequest,
  hasRefreshTokenCookie,
  extractRefreshToken,
  parseCookies,
  hasAuthCookies,
} from "./server";

// Utilities (context-aware)
export {
  // Client utilities
  isAuthenticated,
  getCurrentUser,
  isAuthLoading,
  getAuthHeaders,
  isTokenExpired,
  getTimeUntilExpiration,
  shouldRefreshToken,
  // Server utilities
  isLikelyAuthenticated,
  extractUserFromCookies,
  getAuthConfidence,
  shouldAllowOptimistically,
} from "./utils";
