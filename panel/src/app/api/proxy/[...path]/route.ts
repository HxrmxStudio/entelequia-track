import { NextRequest, NextResponse } from "next/server";
import { refreshAccessToken as authRefreshAccessToken } from "@/services/auth/server";

/**
 * Proxy API route for authenticated backend requests
 * 
 * This route uses centralized authentication functions from @/services/auth/server
 * to handle token refresh and maintain security. It acts as a secure proxy
 * between client requests and the backend API.
 * 
 * Key features:
 * - Uses centralized auth functions (no duplicate logic)
 * - Implements request caching to prevent duplicate refreshes
 * - Forwards cookies and headers appropriately
 * - Never exposes access tokens to the client
 */

/**
 * Simple in-memory cache to prevent concurrent refresh requests
 * Maps cookie header to refresh promise to avoid duplicate token refreshes
 */
const refreshCache = new Map<string, Promise<{ 
  access_token: string; 
  exp: number; 
  cookies?: string[];
} | null>>();

/**
 * Refreshes access token using centralized auth functions (SERVER-SIDE ONLY)
 * 
 * This function handles token refresh entirely on the server to maintain security.
 * Access tokens are ephemeral and never exposed to the client.
 * 
 * @param request NextRequest containing HttpOnly refresh cookie
 * @returns Promise with ephemeral access token for immediate server use, or null if refresh fails
 */
async function refreshAccessToken(request: NextRequest): Promise<{
  access_token: string;
  exp: number;
  cookies?: string[];
} | null> {
  // Detect if we're in Vercel environment
  const isVercel = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
  
  // Try multiple ways to get cookies in Vercel environment
  let cookieHeader = request.headers.get("cookie") || "";

  // If no cookies in headers, try alternative methods
  if (!cookieHeader) {
    // Try different header variations (important for Vercel)
    cookieHeader = request.headers.get("x-cookie") ||
                   request.headers.get("Cookie") ||
                   request.headers.get("cookie") ||
                   "";

    // Try to get cookies from NextRequest if available
    if (!cookieHeader && typeof request.cookies !== 'undefined') {
      try {
        // In Next.js 13+, cookies might be available through request.cookies
        const cookieStore = request.cookies;
        const allCookies = cookieStore.getAll();
        cookieHeader = allCookies
          .map(cookie => `${cookie.name}=${cookie.value}`)
          .join("; ");
      } catch {
        console.log("[PROXY] Could not access cookies through request.cookies");
      }
    }
  }

  // Log Vercel-specific information
  if (isVercel) {
    console.log(`[PROXY] Vercel environment detected - Cookie header length: ${cookieHeader.length}`);
    console.log(`[PROXY] Vercel - Request origin: ${request.headers.get("origin") || "unknown"}`);
    console.log(`[PROXY] Vercel - Request host: ${request.headers.get("host") || "unknown"}`);
  }

  console.log(`[PROXY] Extracted cookie header: ${cookieHeader.substring(0, 50)}...`);

  const cacheKey = `refresh_${cookieHeader}`;
  
  // Check if there's already a refresh in progress for this user
  if (refreshCache.has(cacheKey)) {
    console.log("[PROXY] Using cached refresh request");
    const cachedPromise = refreshCache.get(cacheKey);
    if (cachedPromise) {
      return cachedPromise;
    }
  }
  
  const refreshPromise = performRefresh(request, cookieHeader);
  refreshCache.set(cacheKey, refreshPromise);
  
  // Clean up cache after 10 seconds
  setTimeout(() => refreshCache.delete(cacheKey), 10000);
  
  return refreshPromise;
}

/**
 * Performs the actual token refresh request using centralized auth functions (SERVER-SIDE ONLY)
 * 
 * @param request NextRequest for error context
 * @param cookieHeader Cookie header to forward to backend
 * @returns Promise with fresh access token and updated cookies, or null if refresh fails
 */
async function performRefresh(request: NextRequest, cookieHeader: string): Promise<{
  access_token: string;
  exp: number;
  cookies?: string[];
} | null> {
  try {
    console.log("[PROXY] Refreshing token with cookies:", cookieHeader.substring(0, 50) + "...");
    console.log("[PROXY] Cookie header length:", cookieHeader.length);
    console.log("[PROXY] Cookie header type:", typeof cookieHeader);

    // Use centralized auth function for token refresh, passing cookies directly
    // Fix: Pass cookies as the second parameter, not request
    const result = await authRefreshAccessToken(request, cookieHeader);

    if (result.success && result.data) {
      console.log("[PROXY] Refresh successful via centralized auth");

      return {
        access_token: result.data.access_token,
        exp: result.data.exp,
        cookies: result.cookies || [],
      };
    }

    console.log("[PROXY] Refresh failed:", result.error);
    return null;
  } catch (error) {
    console.error("[PROXY] Token refresh error:", error);
    return null;
  }
}

/**
 * Makes an authenticated request to the backend using ephemeral access token (SERVER-SIDE ONLY)
 * 
 * Access tokens are used immediately and never stored or exposed to clients.
 * This function acts as a secure proxy between client and backend.
 * 
 * @param path API path to call on backend
 * @param accessToken Ephemeral access token (server-side only, never exposed to client)
 * @param request Original NextRequest for header forwarding
 * @param requestBody Optional request body to forward
 * @returns Promise with backend response
 */
async function makeAuthenticatedRequest(
  path: string, 
  accessToken: string, 
  request: NextRequest,
  requestBody?: string | FormData
): Promise<Response> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  
  const headers: Record<string, string> = {
    "Authorization": `Bearer ${accessToken}`,
  };

  // Log cookie forwarding for debugging
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    console.log(`[PROXY] Forwarding cookies to backend: ${cookieHeader.substring(0, 50)}...`);
  } else {
    console.log("[PROXY] No cookies to forward to backend");
  }

  // Only set Content-Type for string bodies (JSON), not for FormData
  if (typeof requestBody === "string") {
    headers["Content-Type"] = "application/json";
  }

  // Forward other headers (except authorization, cookie, and content-length)
  for (const [key, value] of request.headers.entries()) {
    if (!["authorization", "cookie", "content-length"].includes(key.toLowerCase())) {
      // Don't forward content-type for FormData as browser sets multipart boundary
      if (key.toLowerCase() === "content-type" && requestBody instanceof FormData) {
        continue;
      }
      headers[key] = value;
    }
  }

  return fetch(`${API_URL}${path}`, {
    method: request.method,
    headers,
    body: requestBody,
  });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams);
}

/**
 * Main proxy handler for authenticated API requests (SERVER-SIDE ONLY)
 * 
 * This function implements the secure token flow:
 * 1. Refreshes access token using HttpOnly cookie
 * 2. Uses ephemeral access token for backend request
 * 3. Forwards response and any new cookies to client
 * 4. Access tokens never reach the client browser
 * 
 * @param request NextRequest with HttpOnly refresh cookie
 * @param path API path segments to proxy
 * @returns NextResponse with backend data and updated cookies
 */
async function handleRequest(request: NextRequest, { path }: { path: string[] }) {
  try {
    // Detect Vercel environment for better debugging
    const isVercel = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
    
    if (isVercel) {
      console.log(`[PROXY] Vercel environment - Request to: ${request.nextUrl.pathname}`);
      console.log(`[PROXY] Vercel - Origin: ${request.headers.get("origin") || "unknown"}`);
      console.log(`[PROXY] Vercel - User-Agent: ${request.headers.get("user-agent")?.substring(0, 50) || "unknown"}...`);
    }
    
    const fullPath = `/${path.join("/")}`;
    const searchParams = request.nextUrl.searchParams.toString();
    const finalPath = searchParams ? `${fullPath}?${searchParams}` : fullPath;
    
    // Check if this is an auth endpoint (login/register) that doesn't need tokens
    const isAuthEndpoint = fullPath.includes('/auth/login') || fullPath.includes('/auth/register');
    
    // Get request body if present
    let requestBody: string | FormData | undefined;
    if (request.method !== "GET" && request.method !== "HEAD") {
      try {
        const contentType = request.headers.get("content-type") || "";
        if (contentType.includes("multipart/form-data")) {
          requestBody = await request.formData();
        } else {
          requestBody = await request.text();
        }
      } catch {
        // No body or unable to read body
      }
    }
    
    let tokenData = null;
    
    // For auth endpoints (login/register), skip token refresh
    if (!isAuthEndpoint) {
      // First, try to refresh token to get current access token
      tokenData = await refreshAccessToken(request);
      
      if (!tokenData) {
        console.log("[PROXY] Authentication failed - no valid refresh token");
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
      
      console.log("[PROXY] Successfully refreshed access token for proxy request");
    } else {
      console.log("[PROXY] Auth endpoint - skipping token refresh");
    }
    
    // Make the request (with or without token)
    let response: Response;
    
    if (tokenData) {
      // Authenticated request with token
      response = await makeAuthenticatedRequest(finalPath, tokenData.access_token, request, requestBody);
    } else {
      // Direct request for auth endpoints
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      // Forward cookies for auth endpoints (critical for Vercel)
      const cookieHeader = request.headers.get("cookie");
      if (cookieHeader) {
        headers["Cookie"] = cookieHeader;
        console.log(`[PROXY] Forwarding cookies for auth: ${cookieHeader.substring(0, 50)}...`);
      }
      
      // Add Vercel-specific headers for better compatibility
      if (process.env.VERCEL === "1") {
        headers["X-Forwarded-For"] = request.headers.get("x-forwarded-for") || "unknown";
        headers["X-Real-IP"] = request.headers.get("x-real-ip") || "unknown";
        headers["X-Forwarded-Proto"] = request.headers.get("x-forwarded-proto") || "https";
      }
      
      response = await fetch(`${API_URL}${finalPath}`, {
        method: request.method,
        headers,
        body: requestBody,
      });
    }
    
    // If we get 401, the access token might be expired, but we already refreshed it
    // So this indicates a real authentication failure
    if (response.status === 401) {
      console.log("[PROXY] Backend returned 401 - authentication failed");
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }
    
    // Forward the response
    let nextResponse: NextResponse;
    
    // Handle different response status codes properly
    if (response.status === 204) {
      // 204 No Content - create response without body
      nextResponse = new NextResponse(null, {
        status: 204,
      });
    } else {
      // Normal response with content
      const responseData = await response.text();
      nextResponse = new NextResponse(responseData, {
        status: response.status,
        headers: {
          "Content-Type": response.headers.get("Content-Type") || "application/json",
        },
      });
    }
    
    // If we have new cookies from refresh, set them in the response
    if (tokenData?.cookies && tokenData.cookies.length > 0) {
      console.log("[PROXY] Setting cookies in response:", tokenData.cookies);
      tokenData.cookies.forEach(cookie => {
        nextResponse.headers.append("Set-Cookie", cookie);
      });
    } else {
      console.log("[PROXY] No cookies to set in response");
    }
    
    // Forward Set-Cookie headers from backend for auth endpoints
    if (isAuthEndpoint) {
      const setCookieHeaders: string[] = [];
      
      // Try the modern getSetCookie method first
      if (typeof response.headers.getSetCookie === 'function') {
        setCookieHeaders.push(...response.headers.getSetCookie());
      } else {
        // Fallback: manually extract from raw headers
        response.headers.forEach((value, name) => {
          if (name.toLowerCase() === 'set-cookie') {
            setCookieHeaders.push(value);
          }
        });
      }
      
      if (setCookieHeaders.length > 0) {
        console.log("[PROXY] Setting auth cookies in response:", setCookieHeaders);
        setCookieHeaders.forEach(cookie => {
          nextResponse.headers.append("Set-Cookie", cookie);
        });
      }
    }
    
    return nextResponse;
  } catch (error) {
    console.error("Proxy request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
