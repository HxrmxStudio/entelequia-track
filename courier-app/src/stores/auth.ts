import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { endpoints } from "@/services/http";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  role: string | null;
  login: (params: { email: string; password: string; device?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  hydrate: () => Promise<void>;
};

const ACCESS_TOKEN_KEY = "auth-access-token";
const REFRESH_TOKEN_KEY = "auth-refresh-token";
const USER_ID_KEY = "auth-user-id";
const ROLE_KEY = "auth-role";

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  userId: null,
  role: null,
  
  async login({ email, password, device }: { email: string; password: string; device?: string }) {
    const result = await endpoints.login(email, password, device);
    
    // Store both tokens
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, result.access_token);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, result.refresh_token);
    await SecureStore.setItemAsync(ROLE_KEY, result.user.role);
    
    set({ 
      accessToken: result.access_token, 
      refreshToken: result.refresh_token,
      role: result.user.role 
    });
  },
  
  async logout() {
    // Revoke tokens on backend
    try {
      await endpoints.logout();
    } catch (error) {
      // Continue with local cleanup even if backend call fails
      console.warn("Logout backend call failed:", error);
    }
    
    // Clear local storage
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_ID_KEY);
    await SecureStore.deleteItemAsync(ROLE_KEY);
    
    set({ 
      accessToken: null, 
      refreshToken: null, 
      userId: null, 
      role: null 
    });
  },
  
  async refreshAccessToken(): Promise<boolean> {
    const { refreshToken } = get();
    if (!refreshToken) return false;
    
    try {
      const result = await endpoints.refresh(refreshToken);
      
      // Update tokens
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, result.access_token);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, result.refresh_token);
      
      set({ 
        accessToken: result.access_token, 
        refreshToken: result.refresh_token 
      });
      
      return true;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      // Clear invalid tokens
      await get().logout();
      return false;
    }
  },
  
  async hydrate() {
    const [accessToken, refreshToken, userId, role] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.getItemAsync(USER_ID_KEY),
      SecureStore.getItemAsync(ROLE_KEY),
    ]);
    
    set({ 
      accessToken: accessToken ?? null, 
      refreshToken: refreshToken ?? null,
      userId: userId ?? null, 
      role: role ?? null 
    });
  },
}));


