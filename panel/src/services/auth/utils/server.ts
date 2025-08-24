import { NextRequest } from "next/server";
import { hasAuthCookies } from "../server/cookies";

/**
 * Server-side authentication utilities
 * These are optimistic checks suitable for middleware and server components
 */

/**
 * Quick optimistic auth check for middleware
 * Follows NextJS best practices - no network requests in middleware
 * @param request NextRequest to check
 * @returns boolean indicating likely authentication status
 */
export function isLikelyAuthenticated(request: NextRequest): boolean {
  return hasAuthCookies(request);
}

/**
 * Extract user info from cookie header for optimistic checks
 * This doesn't validate tokens - just parses cookie data
 * @param request NextRequest containing cookies
 * @returns object with basic user info or null
 */
export function extractUserFromCookies(request: NextRequest): { email?: string } | null {
  // This is a placeholder - in a real app you might have encrypted user info in cookies
  // For now, just return null since we only store refresh tokens in cookies
  
  // Parse cookies to see if we can extract any user info
  const cookieHeader = request.headers.get("cookie") || "";
  
  // In the future, this could decrypt user data from cookies
  // For now, just return null since we only store refresh tokens
  // Note: We parse cookies here as a foundation for future user data extraction
  if (cookieHeader.includes("rt=")) {
    // We have a refresh token, but no user data in cookies yet
    // This could be extended to decrypt user info from encrypted cookies
  }
  
  return null;
}

/**
 * Check if request is from an authenticated source
 * Uses multiple heuristics for optimistic authentication check
 * @param request NextRequest to analyze
 * @returns confidence score (0-1) of authentication likelihood
 */
export function getAuthConfidence(request: NextRequest): number {
  let confidence = 0;
  
  // Check for refresh token cookie
  if (hasAuthCookies(request)) {
    confidence += 0.8;
  }
  
  // Check User-Agent (real browsers vs bots)
  const userAgent = request.headers.get("user-agent") || "";
  if (userAgent.includes("Mozilla") || userAgent.includes("Chrome") || userAgent.includes("Safari")) {
    confidence += 0.1;
  }
  
  // Check for proper headers
  const acceptHeader = request.headers.get("accept") || "";
  if (acceptHeader.includes("text/html")) {
    confidence += 0.1;
  }
  
  return Math.min(confidence, 1);
}

/**
 * Determine if request should be allowed through optimistically
 * Used by middleware to avoid redirect loops
 * @param request NextRequest to check
 * @returns boolean indicating if request should proceed
 */
export function shouldAllowOptimistically(request: NextRequest): boolean {
  const confidence = getAuthConfidence(request);
  return confidence >= 0.8; // Only allow if we're fairly confident
}
