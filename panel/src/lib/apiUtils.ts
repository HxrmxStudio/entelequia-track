/**
 * API utilities for special cases that need direct backend access
 * Follows SRP by providing focused utilities for auth and direct API calls
 */

import { getClientConfig } from "./config";

const { apiUrl } = getClientConfig();

/**
 * Direct API fetch for auth endpoints that need to bypass proxy
 * Used for login/logout/register that need direct backend access
 */
export async function directApiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    credentials: "include", // Always include cookies for auth
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const text = await response.text();
  
  if (!response.ok) {
    throw new Error(text || `Request failed ${response.status}`);
  }

  return text ? (JSON.parse(text) as T) : ({} as T);
}

/**
 * Type-safe response handler for API responses
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Safe API response parser that handles various response formats
 */
export function parseApiResponse<T>(text: string, status: number): ApiResponse<T> {
  try {
    const parsed = JSON.parse(text);
    return {
      data: parsed as T,
      status,
    };
  } catch {
    return {
      error: text || "Invalid response format",
      status,
    };
  }
}
