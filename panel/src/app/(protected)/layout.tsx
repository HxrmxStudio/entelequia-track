"use client";

import { PropsWithChildren } from "react";
import { getCurrentUser } from "@/services/auth";
import Sidebar from "@/components/sidebar/Sidebar";
import { useSidebar } from "@/hooks/useSidebar";

export default function ProtectedLayout({ children }: PropsWithChildren) {
  const currentUser = getCurrentUser();
  const sidebarState = useSidebar();

  return (
    <div className={`min-h-screen grid grid-cols-1 transition-all duration-300 ${
      sidebarState.isExpanded ? 'md:grid-cols-[256px_minmax(0,1fr)] lg:grid-cols-[256px_minmax(0,1fr)]' : 'md:grid-cols-[64px_minmax(0,1fr)] lg:grid-cols-[64px_minmax(0,1fr)]'
    }`}>
      <Sidebar currentUser={currentUser} sidebarState={sidebarState} />
      
      <section className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {children}
      </section>
    </div>
  );
}