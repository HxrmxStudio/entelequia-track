import { NextRequest } from "next/server";
import { hasAuthCookies } from "../server/cookies";

/**
 * Server-side authentication utilities
 * These are optimistic checks suitable for middleware and server components
 * Updated for NextJS 15+ async cookies and Vercel compliance
 */

/**
 * Quick optimistic auth check for middleware
 * Follows NextJS 15+ best practices - handles async cookie access
 * @param request NextRequest to check
 * @returns boolean indicating likely authentication status
 */
export async function isLikelyAuthenticated(request: NextRequest): Promise<boolean> {
  try {
    // In NextJS 15+, we need to handle cookies differently
    // For middleware, we can still access headers directly
    const cookieHeader = request.headers.get("cookie") || "";
    
    // Check for refresh token cookie (rt=)
    if (cookieHeader.includes("rt=")) {
      return true;
    }
    
    // Additional Vercel-compliant checks
    const userAgent = request.headers.get("user-agent") || "";
    const acceptHeader = request.headers.get("accept") || "";
    
    // Check if this looks like a real browser request
    if (userAgent.includes("Mozilla") || userAgent.includes("Chrome") || userAgent.includes("Safari")) {
      // Check if it's requesting HTML content
      if (acceptHeader.includes("text/html")) {
        return false; // Real browser, no auth cookies
      }
    }
    
    return false;
  } catch (error) {
    console.error("[AUTH UTILS] Error checking authentication:", error);
    return false; // Fail safe - redirect to login
  }
}

/**
 * Extract user info from cookie header for optimistic checks
 * This doesn't validate tokens - just parses cookie data
 * @param request NextRequest containing cookies
 * @returns object with basic user info or null
 */
export function extractUserFromCookies(request: NextRequest): { email?: string } | null {
  try {
    // Parse cookies to see if we can extract any user info
    const cookieHeader = request.headers.get("cookie") || "";
    
    // In the future, this could decrypt user data from cookies
    // For now, just return null since we only store refresh tokens in cookies
    // Note: We parse cookies here as a foundation for future user data extraction
    if (cookieHeader.includes("rt=")) {
      // We have a refresh token, but no user data in cookies yet
      // This could be extended to decrypt user info from encrypted cookies
      return { email: undefined };
    }
    
    return null;
  } catch (error) {
    console.error("[AUTH UTILS] Error extracting user from cookies:", error);
    return null;
  }
}

/**
 * Check if request is from an authenticated source
 * Uses multiple heuristics for optimistic authentication check
 * @param request NextRequest to analyze
 * @returns confidence score (0-1) of authentication likelihood
 */
export function getAuthConfidence(request: NextRequest): number {
  let confidence = 0;
  
  try {
    // Check for refresh token cookie
    const cookieHeader = request.headers.get("cookie") || "";
    if (cookieHeader.includes("rt=")) {
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
  } catch (error) {
    console.error("[AUTH UTILS] Error calculating auth confidence:", error);
    return 0;
  }
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

/**
 * Vercel-compliant cookie validation
 * Ensures cookies meet Vercel's strict requirements
 */
export function validateCookieForVercel(cookie: string): boolean {
  try {
    // Check if cookie has required attributes for Vercel
    const hasHttpOnly = cookie.includes("HttpOnly");
    const hasSecure = cookie.includes("Secure");
    const hasSameSite = cookie.includes("SameSite=");
    
    // Vercel requires these attributes for security
    return hasHttpOnly && hasSecure && hasSameSite;
  } catch (error) {
    console.error("[AUTH UTILS] Error validating cookie for Vercel:", error);
    return false;
  }
}
