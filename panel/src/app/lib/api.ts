"use client"

import type { BackendError } from "../types/backend" 

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
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`)
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
    const res = await fetch(`${API_URL}${path}`, { ...opts, headers, signal: opts.signal ?? controller?.signal })
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
    return await handleResponse<T>(res)
  } finally {
    if (timer) clearTimeout(timer)
  }
}