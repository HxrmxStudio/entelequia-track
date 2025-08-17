import { NextRequest, NextResponse } from "next/server";
import { getServerConfig } from "@/lib/config";

interface SessionResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
  } | null;
  isAuthenticated: boolean;
}

export async function GET(request: NextRequest): Promise<NextResponse<SessionResponse>> {
  try {
    const { apiUrl } = getServerConfig();
    
    // Forward the request to backend with cookies
    const response = await fetch(`${apiUrl}/auth/session`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Forward cookies to backend
        "Cookie": request.headers.get("cookie") || "",
      },
    });

    if (response.ok) {
      const sessionData = await response.json();
      return NextResponse.json({
        user: sessionData.user,
        isAuthenticated: true,
      });
    }

    // If session check fails, user is not authenticated
    return NextResponse.json({
      user: null,
      isAuthenticated: false,
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({
      user: null,
      isAuthenticated: false,
    });
  }
}
