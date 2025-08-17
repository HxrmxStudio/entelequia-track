import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Define protected and auth routes
  const protectedRoutes = ["/dashboard", "/orders", "/shipments", "/routes", "/couriers", "/import", "/alerts"];
  const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/create-password"];
  
  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
  // Skip middleware for API routes (except auth check), static files, and root
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico") || pathname === "/") {
    return NextResponse.next();
  }
  
  if (isProtectedRoute) {
    // Check authentication server-side
    const isAuthenticated = await checkAuthentication(request);
    
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  if (isAuthRoute) {
    // Check if user is already authenticated
    const isAuthenticated = await checkAuthentication(request);
    
    if (isAuthenticated) {
      // Redirect to dashboard if already authenticated
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }
  
  return NextResponse.next();
}

async function checkAuthentication(request: NextRequest): Promise<boolean> {
  try {
    // Use server-side config - not exposed to client
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    
    // Make internal request to session endpoint
    const response = await fetch(`${apiUrl}/auth/session`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Forward cookies to backend
        "Cookie": request.headers.get("cookie") || "",
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Auth check error in middleware:", error);
    return false;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
