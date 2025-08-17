import { NextRequest, NextResponse } from "next/server";

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
 * Refreshes access token using HttpOnly refresh cookie (SERVER-SIDE ONLY)
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
  const cookieHeader = request.headers.get("cookie") || "";
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
 * Performs the actual token refresh request to the backend (SERVER-SIDE ONLY)
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
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    
    console.log("[PROXY] Refreshing token with cookies:", cookieHeader.substring(0, 50) + "...");
    
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
      },
    });

    if (response.ok) {
      const data = await response.json();
      
      // Extract ALL Set-Cookie headers to forward to browser
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
      
      console.log("[PROXY] Refresh successful, got cookies:", setCookieHeaders);
      
      return {
        access_token: data.access_token,
        exp: data.exp,
        cookies: setCookieHeaders,
      };
    }
    
    return null;
  } catch (error) {
    console.error("Token refresh error:", error);
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
    const fullPath = `/${path.join("/")}`;
    const searchParams = request.nextUrl.searchParams.toString();
    const finalPath = searchParams ? `${fullPath}?${searchParams}` : fullPath;
    
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
    
    // First, try to refresh token to get current access token
    const tokenData = await refreshAccessToken(request);
    
    if (!tokenData) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    
    // Make the authenticated request
    const response = await makeAuthenticatedRequest(finalPath, tokenData.access_token, request, requestBody);
    
    // If we get 401, the access token might be expired, but we already refreshed it
    // So this indicates a real authentication failure
    if (response.status === 401) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }
    
    // Forward the response
    const responseData = await response.text();
    
    const nextResponse = new NextResponse(responseData, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });
    
    // If we have new cookies from refresh, set them in the response
    if (tokenData.cookies && tokenData.cookies.length > 0) {
      console.log("[PROXY] Setting cookies in response:", tokenData.cookies);
      tokenData.cookies.forEach(cookie => {
        nextResponse.headers.append("Set-Cookie", cookie);
      });
    } else {
      console.log("[PROXY] No cookies to set in response");
    }
    
    return nextResponse;
  } catch (error) {
    console.error("Proxy request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
