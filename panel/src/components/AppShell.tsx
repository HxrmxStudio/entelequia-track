"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Truck, Upload, BarChart3, Settings, LogOut } from "lucide-react";
import { PropsWithChildren } from "react";

export default function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const nav = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: "/orders", label: "Orders", icon: <Package className="w-4 h-4" /> },
    { href: "/shipments", label: "Shipments", icon: <Truck className="w-4 h-4" /> },
    { href: "/import", label: "Import", icon: <Upload className="w-4 h-4" /> },
    { href: "/analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="border-r bg-white">
        <div className="h-14 flex items-center px-4 border-b">
          <div>
            <div className="text-lg font-semibold leading-tight">Entelequia</div>
            <div className="text-xs text-gray-500">entelequia-track</div>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {nav.map(item => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={
                `flex items-center gap-2 px-3 py-2 rounded-md text-sm ${active ? "bg-emerald-100 text-emerald-900" : "text-gray-700 hover:bg-gray-100"}`
              }>
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto p-3 hidden md:block">
          <a href="/logout" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm px-3 py-2 rounded-md">
            <LogOut className="w-4 h-4" /> Logout
          </a>
        </div>
      </aside>
      <section className="min-h-screen bg-gray-50">
        {children}
      </section>
    </div>
  );
}


