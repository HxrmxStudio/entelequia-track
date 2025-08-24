"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/services/auth";
import { useAuthStore } from "@/stores/auth";

export function useRequireAuth() {
  const router = useRouter();
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  useEffect(() => {
    // Initialize auth state from session endpoint
    initializeAuth();
  }, [initializeAuth]);
  
  useEffect(() => {
    // Don't redirect while still loading
    if (isLoading) return;
    
    // Check if authenticated
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [isLoading, router]);
}


