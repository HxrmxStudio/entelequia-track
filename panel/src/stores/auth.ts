import { create } from "zustand";
import type { User } from "@/services/auth/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  setAuth: (user: User) => {
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  },
  
  clearAuth: () => {
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
  
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    
    try {
      // Check session with backend via cookie
      const response = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "include",
      });
      
      if (response.ok) {
        const sessionData = await response.json();
        if (sessionData.isAuthenticated && sessionData.user) {
          set({
            user: sessionData.user,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      }
      
      // If session check fails, clear auth state
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error initializing auth:", error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
