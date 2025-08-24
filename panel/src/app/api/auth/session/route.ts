import { NextRequest } from "next/server";
import { handleSessionRequest } from "@/services/auth/server";

/**
 * Server-side session validation endpoint (SERVER-SIDE ONLY)
 * 
 * Validates user session using HttpOnly refresh cookie without exposing tokens.
 * Returns only user data and authentication status to the client.
 * 
 * @param request NextRequest containing HttpOnly refresh cookie
 * @returns NextResponse with user data and authentication status (no tokens)
 */
export async function GET(request: NextRequest) {
  return handleSessionRequest(request);
}
