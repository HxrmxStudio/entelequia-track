"use client";

import type { PropsWithChildren, ReactNode } from "react";

export function Card({ children }: PropsWithChildren) {
  return <div className="border rounded-lg bg-white shadow-sm">{children}</div>;
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

export function CardBody({ children }: PropsWithChildren) {
  return <div className="p-4">{children}</div>;
}


