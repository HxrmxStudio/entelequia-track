"use client"

import type { BackendError } from "../types/backend" 
import { useAuthStore } from "@/stores/auth";

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

export const API_URL: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export function authHeaders(base?: HeadersInit): Headers {
  const headers = new Headers(base || {})
  const accessToken = useAuthStore.getState().accessToken
  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`)
  }
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

// Refresh token interceptor
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    
    if (response.ok) {
      const data = await response.json();
      useAuthStore.getState().updateAccessToken(data.access_token, data.exp);
      return data.access_token;
    }
    
    // If refresh fails, clear auth state
    if (response.status === 401) {
      console.warn("Refresh token invalid, clearing auth state");
      useAuthStore.getState().clearAuth();
    }
    
    return null;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
}

export async function apiFetch<T>(path: string, opts: RequestInit & { timeoutMs?: number } = {}): Promise<T> {
  const headers = authHeaders(opts.headers)
  const timeoutMs = typeof opts.timeoutMs === "number" ? opts.timeoutMs : 15000
  const controller = !opts.signal ? new AbortController() : undefined
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : undefined
  
  try {
    const res = await fetch(`${API_URL}${path}`, { ...opts, headers, signal: opts.signal ?? controller?.signal })
    
    // Handle 401 Unauthorized with refresh token logic
    if (res.status === 401 && !path.includes("/auth/refresh")) {
      if (isRefreshing) {
        // Wait for the current refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          // Retry the original request
          return apiFetch<T>(path, opts);
        });
      }
      
      isRefreshing = true;
      
      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          processQueue(null, newToken);
          // Retry the original request
          return apiFetch<T>(path, opts);
        } else {
          processQueue(new Error("Failed to refresh token"));
          useAuthStore.getState().clearAuth();
          throw new ApiError("Authentication failed", 401);
        }
      } finally {
        isRefreshing = false;
      }
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
    const res = await fetch(`${API_URL}${path}`, { method: "POST", ...opts, headers, body: formData, signal: opts.signal ?? controller?.signal })
    
    // Handle 401 Unauthorized with refresh token logic
    if (res.status === 401 && !path.includes("/auth/refresh")) {
      if (isRefreshing) {
        // Wait for the current refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          // Retry the original request
          return apiForm<T>(path, formData, opts);
        });
      }
      
      isRefreshing = true;
      
      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          processQueue(null, newToken);
          // Retry the original request
          return apiForm<T>(path, formData, opts);
        } else {
          processQueue(new Error("Failed to refresh token"));
          useAuthStore.getState().clearAuth();
          throw new ApiError("Authentication failed", 401);
        }
      } finally {
        isRefreshing = false;
      }
    }
    
    return await handleResponse<T>(res)
  } finally {
    if (timer) clearTimeout(timer)
  }
}