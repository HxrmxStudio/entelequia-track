"use client";

import { AlertTriangle, Bell } from "lucide-react";

type AlertItem = { id: string; title: string; ts: string; severity: "low" | "medium" | "high" };

type Props = {
  alerts: ReadonlyArray<AlertItem>;
};

export default function AlertsPanel({ alerts }: Props) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-4 h-4" />
        <h2 className="font-semibold">Alertas</h2>
      </div>
      <ul className="space-y-2 text-sm">
        {alerts.length === 0 && <li className="text-gray-500">Sin alertas</li>}
        {alerts.map(a => (
          <li key={a.id} className="flex items-center gap-2">
            <AlertTriangle className={severityColor(a.severity)} />
            <span className="flex-1">{a.title}</span>
            <span className="text-gray-500 text-xs">{new Date(a.ts).toLocaleTimeString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function severityColor(s: AlertItem["severity"]): string {
  if (s === "high") return "w-4 h-4 text-red-600";
  if (s === "medium") return "w-4 h-4 text-amber-600";
  return "w-4 h-4 text-gray-600";
}


