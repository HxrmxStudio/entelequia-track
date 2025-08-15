import { create } from "zustand";
import { persist } from "zustand/middleware";
import { tokenManager } from "@/services/auth/token-manager";

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  tokenExpiration: number | null; // JWT expiration timestamp
  setAuth: (accessToken: string, user: User, exp?: number) => void;
  clearAuth: () => void;
  updateAccessToken: (accessToken: string, exp?: number) => void;
  isTokenExpired: () => boolean;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      tokenExpiration: null,
      
      setAuth: (accessToken: string, user: User, exp?: number) => {
        set({
          accessToken,
          user,
          isAuthenticated: true,
          tokenExpiration: exp || null,
        });
        
        // Initialize token manager for auto-refresh
        if (exp) {
          tokenManager.initialize();
        }
      },
      
      clearAuth: () => {
        // Clean up token manager
        tokenManager.cleanup();
        
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
          tokenExpiration: null,
        });
      },
      
      updateAccessToken: (accessToken: string, exp?: number) => {
        set({ 
          accessToken,
          tokenExpiration: exp || null,
        });
        
        // Re-initialize token manager with new expiration
        if (exp) {
          tokenManager.initialize();
        }
      },
      
      isTokenExpired: () => {
        const { tokenExpiration } = get();
        if (!tokenExpiration) return true;
        
        const currentTime = Math.floor(Date.now() / 1000);
        return currentTime >= tokenExpiration;
      },

      initializeAuth: () => {
        const { accessToken, tokenExpiration, isAuthenticated } = get();
        
        if (isAuthenticated && accessToken && tokenExpiration) {
          // Initialize token manager for existing session
          tokenManager.initialize();
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        tokenExpiration: state.tokenExpiration,
      }),
      // Only persist user info and expiration, not the access token
    }
  )
);
