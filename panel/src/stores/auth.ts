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
        // This function is called after hydration to ensure persisted state is properly loaded
        // The persist middleware handles the restoration, so we just need to verify the state
        const { accessToken, tokenExpiration, isAuthenticated } = get();
        
        // Only initialize token manager if we have valid persisted data
        if (isAuthenticated && accessToken && tokenExpiration && !get().isTokenExpired()) {
          tokenManager.initialize();
        } else if (accessToken && tokenExpiration && get().isTokenExpired()) {
          // Token is expired, clear the auth state
          get().clearAuth();
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ 
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        tokenExpiration: state.tokenExpiration,
      }),
      // Persist all auth data including access token
    }
  )
);
