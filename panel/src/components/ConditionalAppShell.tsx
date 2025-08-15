"use client";

import { usePathname } from "next/navigation";
import AppShell from "@/components/AppShell";
import { useRequireAuth } from "../../hooks/useRequireAuth";

export default function ConditionalAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname?.startsWith('/login') || 
                     pathname?.startsWith('/register') || 
                     pathname?.startsWith('/forgot-password') || 
                     pathname?.startsWith('/reset-password') || 
                     pathname?.startsWith('/create-password');

  // Initialize auth system (runs on every route change)
  useRequireAuth();

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
