import { NextRequest, NextResponse } from "next/server";

interface RefreshResponse {
  access_token: string;
  exp: number;
  token_type: string;
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
}

/**
 * Server-side token refresh function
 * Refreshes access token using HttpOnly cookies for maximum security
 * @param request NextRequest containing HttpOnly refresh cookie
 * @returns Promise with fresh access token and updated refresh cookie
 */
export async function refreshAccessToken(request: NextRequest): Promise<{ 
  success: boolean; 
  data?: RefreshResponse; 
  cookies?: string[];
  error?: string; 
}> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    
    // Forward the request to backend with cookies
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Forward cookies to backend
        "Cookie": request.headers.get("cookie") || "",
      },
    });

    const data = await response.text();

    if (response.ok) {
      const refreshData = JSON.parse(data) as RefreshResponse;
      
      // Extract Set-Cookie headers to forward to browser
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
      
      return {
        success: true,
        data: refreshData,
        cookies: setCookieHeaders,
      };
    }

    return {
      success: false,
      error: data || "Refresh failed",
    };
  } catch (error) {
    console.error("Token refresh error:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

/**
 * Next.js API route handler for token refresh
 */
export async function handleRefreshRequest(request: NextRequest): Promise<NextResponse> {
  const result = await refreshAccessToken(request);
  
  if (result.success && result.data) {
    // Create response with the access token
    const nextResponse = NextResponse.json({
      access_token: result.data.access_token,
      exp: result.data.exp,
      token_type: result.data.token_type,
      user: result.data.user,
    });

    // Forward Set-Cookie headers from backend (new refresh token)
    if (result.cookies && result.cookies.length > 0) {
      result.cookies.forEach(cookie => {
        nextResponse.headers.append("Set-Cookie", cookie);
      });
    }

    return nextResponse;
  }

  // If refresh fails, return the error
  return NextResponse.json(
    { error: result.error || "Refresh failed" },
    { status: 401 }
  );
}
