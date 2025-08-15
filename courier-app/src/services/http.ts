import Constants from "expo-constants";
import { useAuthStore } from "@/stores/auth";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

const API_URL: string = (Constants.expoConfig?.extra?.apiUrl as string) ?? "http://localhost:3000";

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
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  // Handle 401 with refresh token logic
  if (res.status === 401 && options?.auth && !path.includes("/auth/refresh")) {
    const success = await useAuthStore.getState().refreshAccessToken();
    if (success) {
      // Retry the request with new token
      const newAccessToken = useAuthStore.getState().accessToken;
      if (newAccessToken) {
        headers.Authorization = `Bearer ${newAccessToken}`;
        const retryRes = await fetch(`${API_URL}${path}`, {
          method,
          headers,
          body: options?.body ? JSON.stringify(options.body) : undefined,
        });
        
        if (!retryRes.ok) {
          const text = await retryRes.text().catch(() => "");
          throw new Error(`HTTP ${retryRes.status}: ${text}`);
        }
        
        if (retryRes.status === 204) {
          return undefined as unknown as T;
        }
        
        const data = (await retryRes.json()) as T;
        return data;
      }
    }
    
    // If refresh failed, throw the original error
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

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
  login: (email: string, password: string, device?: string) => http<{ 
    access_token: string; 
    refresh_token: string;
    user: { id: string; email: string; name?: string; role: string };
  }>(
    "/auth/login",
    { method: "POST", body: { email, password, device } }
  ),
  
  refresh: (refreshToken: string) => http<{ 
    access_token: string; 
    refresh_token: string;
    user: { id: string; email: string; name?: string; role: string };
  }>(
    "/auth/refresh",
    { 
      method: "POST", 
      headers: { Authorization: `Bearer ${refreshToken}` }
    }
  ),
  
  logout: () => http("/auth/logout", { method: "POST", auth: true }),
  
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


