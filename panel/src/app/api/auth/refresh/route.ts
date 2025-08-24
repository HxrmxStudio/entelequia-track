import { NextRequest } from "next/server";
import { handleRefreshRequest } from "@/services/auth/server";

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
  return handleRefreshRequest(request);
}
