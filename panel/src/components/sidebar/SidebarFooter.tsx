"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/services/auth";

interface SidebarFooterProps {
  compact?: boolean;
}

export default function SidebarFooter({ compact = false }: SidebarFooterProps) {
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  if (compact) {
    return (
      <div className="mt-auto p-2">
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center p-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm rounded-lg w-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group relative cursor-pointer"
          title="Logout"
        >
          <LogOut className="w-5 h-5 transition-all duration-200 icon-hover" />
          
          {/* Tooltip */}
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg tooltip-enter">
            Logout
            <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-100"></div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="mt-auto p-3">
      <button 
        onClick={handleLogout}
        className="flex items-center gap-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm px-3 py-3 rounded-lg w-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group cursor-pointer"
      >
        <LogOut className="w-5 h-5 transition-all duration-200 icon-hover" /> 
        <span>Logout</span>
      </button>
    </div>
  );
}
