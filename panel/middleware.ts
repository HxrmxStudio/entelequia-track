import { NextRequest, NextResponse } from "next/server";
import { isLikelyAuthenticated } from "@/services/auth/utils/server";

/**
 * Optimized middleware following NextJS best practices
 * Uses optimistic checks - no network requests per NextJS guidelines
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Define protected and auth routes
  const protectedRoutes = ["/dashboard", "/orders", "/shipments", "/routes", "/couriers", "/import", "/alerts"];
  const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/create-password"];
  
  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
  // Skip middleware for API routes, static files, and root
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico") || pathname === "/") {
    return NextResponse.next();
  }
  
  if (isProtectedRoute) {
    // Use optimistic check - no network requests (NextJS best practice)
    const hasAuthCookies = isLikelyAuthenticated(request);
    
    if (!hasAuthCookies) {
      console.log(`[MIDDLEWARE] Redirecting user without auth cookies from ${pathname} to login`);
      // Redirect to login if no auth cookies
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    console.log(`[MIDDLEWARE] Allowing access to ${pathname} (has auth cookies)`);
  }
  
  if (isAuthRoute) {
    // Use optimistic check for auth routes too
    const hasAuthCookies = isLikelyAuthenticated(request);
    
    if (hasAuthCookies) {
      console.log(`[MIDDLEWARE] Redirecting authenticated user from ${pathname} to dashboard`);
      // Redirect to dashboard if already has auth cookies
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }
  
  return NextResponse.next();
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
