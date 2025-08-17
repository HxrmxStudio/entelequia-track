import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side token refresh endpoint (SERVER-SIDE ONLY)
 * 
 * This endpoint handles token refresh using HttpOnly cookies for maximum security.
 * Access tokens returned are intended for immediate server-side use only.
 * 
 * @param request NextRequest containing HttpOnly refresh cookie
 * @returns NextResponse with fresh access token and updated refresh cookie
 */
export async function POST(request: NextRequest) {
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
      const refreshData = JSON.parse(data);
      
      // Create response with the access token
      const nextResponse = NextResponse.json({
        access_token: refreshData.access_token,
        exp: refreshData.exp,
        token_type: refreshData.token_type,
        user: refreshData.user,
      });

      // Forward the Set-Cookie header from backend (new refresh token)
      const setCookieHeader = response.headers.get("set-cookie");
      if (setCookieHeader) {
        nextResponse.headers.set("set-cookie", setCookieHeader);
      }

      return nextResponse;
    }

    // If refresh fails, return the error
    return NextResponse.json(
      { error: data || "Refresh failed" },
      { status: response.status }
    );
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
