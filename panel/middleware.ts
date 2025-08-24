import { NextRequest, NextResponse } from "next/server";
import { isLikelyAuthenticated } from "@/services/auth/utils/server";

/**
 * Optimized middleware following NextJS 15+ best practices
 * Uses optimistic checks - no network requests per NextJS guidelines
 * Updated for NextJS 15+ async cookies API
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Define protected and auth routes
  const protectedRoutes = ["/dashboard", "/orders", "/shipments", "/routes", "/couriers", "/import", "/alerts"];
  const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/create-password"];
  
  // Skip middleware for API routes, static files, and root
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico") || pathname === "/") {
    return NextResponse.next();
  }
  
  if (isProtectedRoute(pathname)) {
    // Use optimistic check - no network requests (NextJS best practice)
    // Note: In NextJS 15+, cookies are accessed differently in middleware
    const hasAuthCookies = await isLikelyAuthenticated(request);
    
    if (!hasAuthCookies) {
      console.log(`[MIDDLEWARE] Redirecting user without auth cookies from ${pathname} to login`);
      // Redirect to login if no auth cookies
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    console.log(`[MIDDLEWARE] Allowing access to ${pathname} (has auth cookies)`);
  }
  
  if (isAuthRoute(pathname)) {
    // Use optimistic check for auth routes too
    const hasAuthCookies = await isLikelyAuthenticated(request);
    
    if (hasAuthCookies) {
      console.log(`[MIDDLEWARE] Redirecting authenticated user from ${pathname} to dashboard`);
      // Redirect to dashboard if already has auth cookies
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }
  
  return NextResponse.next();
}

// Helper function to check if current path is protected
function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = ["/dashboard", "/orders", "/shipments", "/routes", "/couriers", "/import", "/alerts"];
  return protectedRoutes.some(route => pathname.startsWith(route));
}

// Helper function to check if current path is auth route
function isAuthRoute(pathname: string): boolean {
  const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/create-password"];
  return authRoutes.some(route => pathname.startsWith(route));
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
