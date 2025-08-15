"use client";

import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn("border rounded-lg bg-white shadow-sm", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="px-4 py-3 border-b flex items-center justify-between">
      <div>
        <h3 className="font-semibold tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function CardBody({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn("p-4", className)}>
      {children}
    </div>
  );
}


