"use client";

import { UseSidebarReturn } from "../../hooks/useSidebar";
import SidebarHeader from "../sidebar/SidebarHeader";
import SidebarUserInfo from "../sidebar/SidebarUserInfo";
import SidebarNavigation from "../sidebar/SidebarNavigation";
import SidebarFooter from "../sidebar/SidebarFooter";

interface SidebarProps {
  currentUser?: {
    email: string;
    role: string;
  } | null;
  sidebarState: UseSidebarReturn;
}

export default function Sidebar({ currentUser, sidebarState }: SidebarProps) {
  const { isExpanded, handleMouseEnter, handleMouseLeave } = sidebarState;

  return (
    <aside 
      className={`relative border-r bg-white dark:bg-gray-900 transition-all duration-200 ease-in-out z-20 sidebar-transition ${
        isExpanded ? 'w-64 shadow-lg' : 'w-16'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Expanded State Overlay */}
      <div className={`absolute inset-0 bg-white dark:bg-gray-900 transition-opacity duration-200 ${
        isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <SidebarHeader />
        <SidebarUserInfo currentUser={currentUser} />
        <SidebarNavigation />
        <SidebarFooter />
      </div>

      {/* Compact State (Default) */}
      <div className={`absolute inset-0 transition-opacity duration-200 ${
        isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        <SidebarHeader compact />
        <SidebarUserInfo currentUser={currentUser} compact />
        <SidebarNavigation compact />
        <SidebarFooter compact />
      </div>
    </aside>
  );
}