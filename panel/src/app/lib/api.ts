"use client";

export const API_URL: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export function authHeaders(base?: HeadersInit): Headers {
  const headers = new Headers(base || {});
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

export async function apiFetch<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers = authHeaders(opts.headers);
  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  const text = await res.text();
  if (!res.ok) {
    try {
      const err = JSON.parse(text);
      throw new Error(typeof err === "string" ? err : err.error || text);
    } catch {
      throw new Error(text || `Request failed ${res.status}`);
    }
  }
  return (text ? JSON.parse(text) : {}) as T;
}

export async function apiForm<T>(path: string, formData: FormData, opts: RequestInit = {}): Promise<T> {
  const headers = authHeaders(opts.headers);
  const res = await fetch(`${API_URL}${path}`, { method: "POST", ...opts, headers, body: formData });
  const text = await res.text();
  if (!res.ok) throw new Error(text || `Request failed ${res.status}`);
  return (text ? JSON.parse(text) : {}) as T;
}
