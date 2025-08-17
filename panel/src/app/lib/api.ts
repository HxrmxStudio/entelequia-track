"use client"

import type { BackendError } from "../types/backend" 
import { useAuthStore } from "@/stores/auth";
import { getClientConfig } from "@/lib/config";

export class ApiError extends Error {
  status: number
  payload?: BackendError
  constructor(message: string, status: number, payload?: BackendError) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.payload = payload
  }
}

const { apiUrl: API_URL } = getClientConfig();

// Export API_URL for direct usage in auth services
export { API_URL };

export function authHeaders(base?: HeadersInit): Headers {
  const headers = new Headers(base || {})
  // No need to add Authorization header since we use cookies for auth
  return headers
}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!res.ok) {
    try {
      const payload = text ? (JSON.parse(text) as BackendError) : undefined
      const message = payload?.error || text || `Request failed ${res.status}`
      throw new ApiError(message, res.status, payload)
    } catch {
      throw new ApiError(text || `Request failed ${res.status}`, res.status)
    }
  }
  return (text ? (JSON.parse(text) as T) : ({} as T))
}

export async function apiFetch<T>(path: string, opts: RequestInit & { timeoutMs?: number } = {}): Promise<T> {
  const headers = authHeaders(opts.headers)
  const timeoutMs = typeof opts.timeoutMs === "number" ? opts.timeoutMs : 15000
  const controller = !opts.signal ? new AbortController() : undefined
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : undefined
  
  try {
    // For auth endpoints, use direct API calls
    if (path.startsWith("/auth/")) {
      const res = await fetch(`${API_URL}${path}`, { 
        ...opts, 
        headers, 
        credentials: "include", // Include cookies for auth
        signal: opts.signal ?? controller?.signal 
      })
      
      // Handle 401 Unauthorized by clearing auth state and redirecting
      if (res.status === 401 && !path.includes("/auth/refresh")) {
        useAuthStore.getState().clearAuth();
        // Redirect to login page
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
        throw new ApiError("Authentication failed", 401);
      }
      
      return await handleResponse<T>(res)
    }
    
    // For other endpoints, use the proxy that handles authentication
    const res = await fetch(`/api/proxy${path}`, { 
      ...opts, 
      headers, 
      credentials: "include", // Include cookies for auth
      signal: opts.signal ?? controller?.signal 
    })
    
    // Handle 401 Unauthorized by clearing auth state and redirecting
    if (res.status === 401) {
      useAuthStore.getState().clearAuth();
      // Redirect to login page
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
      throw new ApiError("Authentication failed", 401);
    }
    
    return await handleResponse<T>(res)
  } finally {
    if (timer) clearTimeout(timer)
  }
}

export async function apiForm<T>(path: string, formData: FormData, opts: RequestInit & { timeoutMs?: number } = {}): Promise<T> {
  const headers = authHeaders(opts.headers)
  const timeoutMs = typeof opts.timeoutMs === "number" ? opts.timeoutMs : 20000
  const controller = !opts.signal ? new AbortController() : undefined
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : undefined
  
  try {
    // For auth endpoints, use direct API calls
    if (path.startsWith("/auth/")) {
      const res = await fetch(`${API_URL}${path}`, { 
        method: "POST", 
        ...opts, 
        headers, 
        body: formData, 
        credentials: "include", // Include cookies for auth
        signal: opts.signal ?? controller?.signal 
      })
      
      // Handle 401 Unauthorized by clearing auth state and redirecting
      if (res.status === 401 && !path.includes("/auth/refresh")) {
        useAuthStore.getState().clearAuth();
        // Redirect to login page
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
        throw new ApiError("Authentication failed", 401);
      }
      
      return await handleResponse<T>(res)
    }
    
    // For other endpoints, use the proxy that handles authentication
    // Note: For FormData, we don't set Content-Type header, let the browser set it
    const formHeaders = new Headers(opts.headers || {})
    const res = await fetch(`/api/proxy${path}`, { 
      method: "POST", 
      ...opts, 
      headers: formHeaders, 
      body: formData, 
      credentials: "include", // Include cookies for auth
      signal: opts.signal ?? controller?.signal 
    })
    
    // Handle 401 Unauthorized by clearing auth state and redirecting
    if (res.status === 401) {
      useAuthStore.getState().clearAuth();
      // Redirect to login page
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
      throw new ApiError("Authentication failed", 401);
    }
    
    return await handleResponse<T>(res)
  } finally {
    if (timer) clearTimeout(timer)
  }
}