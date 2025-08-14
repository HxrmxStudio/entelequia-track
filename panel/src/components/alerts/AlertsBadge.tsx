"use client";
import { useEffect, useState } from "react";
import { countOpenAlerts } from "@/services/alerts/countOpen";
import { subscribeToAlerts } from "@/services/alerts/subscribe";

export default function AlertsBadge() {
  const [count, setCount] = useState<number>(0);

  async function init() {
    try {
      setCount(await countOpenAlerts());
    } catch {
      // ignore
    }
  }

  useEffect(() => { init(); }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAlerts({
      onAlert: () => setCount((c) => c + 1),
      onResolved: () => setCount((c) => Math.max(0, c - 1)),
    });
    return () => unsubscribe();
  }, []);

  // UI mínima del badge (puedes reemplazar por shadcn/ui Badge)
  return (
    <a href="/alerts" className="inline-flex items-center gap-2 px-2 py-1 border rounded">
      <span>Alertas</span>
      <span className="inline-flex min-w-6 h-6 items-center justify-center rounded-full bg-red-600 text-white text-xs px-1">
        {count}
      </span>
    </a>
  );
}
