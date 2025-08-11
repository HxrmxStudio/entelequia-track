import Constants from "expo-constants";
import { useAuthStore } from "@/stores/auth";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

const API_URL: string = (Constants.expoConfig?.extra?.apiUrl as string) ?? "http://localhost:3001";

export async function http<T>(path: string, options?: {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
}): Promise<T> {
  const method = options?.method ?? "GET";
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options?.headers ?? {}),
  };

  if (options?.auth) {
    const token = useAuthStore.getState().token;
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  if (res.status === 204) {
    return undefined as unknown as T;
  }

  const data = (await res.json()) as T;
  return data;
}

export const endpoints = {
  login: (email: string, password: string) => http<{ token: string; role: string }>(
    "/auth/login",
    { method: "POST", body: { email, password } }
  ),
  shipmentsIndex: () => http<unknown>("/shipments", { auth: true }),
  locationPing: (payload: {
    courier_id: string;
    ts: string;
    lat: number;
    lon: number;
    accuracy?: number;
    speed?: number;
    battery?: number;
  }) => http("/locations", { method: "POST", body: payload, auth: true }),
};


