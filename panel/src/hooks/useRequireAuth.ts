"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "../../utils/auth-utils";
import { useAuthStore } from "@/stores/auth";

export function useRequireAuth() {
  const router = useRouter();
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Initialize auth state from localStorage first
    initializeAuth();
    
    // Small delay to ensure store is properly hydrated
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [initializeAuth]);
  
  useEffect(() => {
    if (!isInitialized) return;
    
    // Then check if authenticated
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [isInitialized, router]);
}


