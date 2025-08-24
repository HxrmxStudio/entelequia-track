import { NextRequest, NextResponse } from "next/server";

interface SessionResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
  } | null;
  isAuthenticated: boolean;
}

/**
 * Server-side session validation function
 * Validates user session using HttpOnly refresh cookie without exposing tokens
 * @param request NextRequest containing HttpOnly refresh cookie
 * @returns Promise with user data and authentication status (no tokens)
 */
export async function validateSession(request: NextRequest): Promise<SessionResponse> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    
    // Forward the request to backend with cookies
    const response = await fetch(`${API_URL}/auth/session`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Forward cookies to backend
        "Cookie": request.headers.get("cookie") || "",
      },
    });

    if (response.ok) {
      const sessionData = await response.json();
      return {
        user: sessionData.user,
        isAuthenticated: true,
      };
    }

    // If session check fails, user is not authenticated
    return {
      user: null,
      isAuthenticated: false,
    };
  } catch (error) {
    console.error("Session validation error:", error);
    return {
      user: null,
      isAuthenticated: false,
    };
  }
}

/**
 * Next.js API route handler for session validation
 */
export async function handleSessionRequest(request: NextRequest): Promise<NextResponse<SessionResponse>> {
  const sessionData = await validateSession(request);
  return NextResponse.json(sessionData);
}
