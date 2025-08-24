import { NextRequest } from "next/server";

/**
 * Server-side cookie utilities for authentication
 */

/**
 * Check if request has a refresh token cookie
 * @param request NextRequest to check
 * @returns boolean indicating if refresh token cookie exists
 */
export function hasRefreshTokenCookie(request: NextRequest): boolean {
  const cookieHeader = request.headers.get("cookie") || "";
  return cookieHeader.includes("rt=");
}

/**
 * Extract refresh token from cookie header
 * @param request NextRequest containing cookies
 * @returns refresh token string or null if not found
 */
export function extractRefreshToken(request: NextRequest): string | null {
  const cookieHeader = request.headers.get("cookie") || "";
  
  // Parse cookies manually to extract rt value
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, string>);
  
  return cookies.rt || null;
}

/**
 * Get all cookies from request as object
 * @param request NextRequest containing cookies
 * @returns object with cookie key-value pairs
 */
export function parseCookies(request: NextRequest): Record<string, string> {
  const cookieHeader = request.headers.get("cookie") || "";
  
  return cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Check if user appears to be authenticated based on cookies
 * This is an optimistic check for middleware - doesn't validate token
 * @param request NextRequest to check
 * @returns boolean indicating likely authentication status
 */
export function hasAuthCookies(request: NextRequest): boolean {
  return hasRefreshTokenCookie(request);
}
