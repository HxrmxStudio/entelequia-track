"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Upload, BarChart3, Settings, Truck, Bike, Route } from "lucide-react";

interface SidebarNavigationProps {
  compact?: boolean;
}

export default function SidebarNavigation({ compact = false }: SidebarNavigationProps) {
  const pathname = usePathname();
  
  const nav = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, description: "Overview and metrics" },
    { href: "/couriers", label: "Couriers", icon: <Bike className="w-5 h-5" />, description: "Manage delivery personnel" },
    { href: "/routes", label: "Routes", icon: <Route className="w-5 h-5" />, description: "Plan and optimize routes" },
    { href: "/orders", label: "Orders", icon: <Package className="w-5 h-5" />, description: "Track customer orders" },
    { href: "/shipments", label: "Shipments", icon: <Truck className="w-5 h-5" />, description: "Monitor deliveries" },
    { href: "/import", label: "Import", icon: <Upload className="w-5 h-5" />, description: "Bulk data import" },
    { href: "/analytics", label: "Analytics", icon: <BarChart3 className="w-5 h-5" />, description: "Performance insights" },
    { href: "/settings", label: "Settings", icon: <Settings className="w-5 h-5" />, description: "System configuration" }
  ];

  if (compact) {
    return (
      <nav className="p-2 space-y-1">
        {nav.map(item => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center justify-center p-3 rounded-lg text-sm transition-all duration-200 relative ${
                active 
                  ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
              title={item.label}
            >
              <div className={`transition-all duration-200 icon-hover ${
                active ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {item.icon}
              </div>
              
              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg tooltip-enter">
                {item.label}
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-100"></div>
              </div>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="p-3 space-y-1">
      {nav.map((item) => {
        const active = pathname?.startsWith(item.href);
        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className={`flex items-start gap-3 px-3 py-3 rounded-lg text-sm transition-all duration-200 ${
              active 
                ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100 shadow-sm" 
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {/* Fixed width icon container for consistent alignment */}
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className={`transition-all duration-200 icon-hover ${
                active ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {item.icon}
              </div>
            </div>
            
            {/* Text container with proper alignment */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="font-medium leading-tight">{item.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 leading-tight mt-0.5">
                {item.description}
              </div>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
