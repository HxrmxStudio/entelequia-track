"use client";

import { useAuthStore } from "@/stores/auth";
import { useEffect } from "react";

export default function ConditionalAppShell({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  
  // Initialize auth system on app start
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Auth routes are handled by their own layout - just pass through children
  return <>{children}</>;
}
