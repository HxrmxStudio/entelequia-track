"use client";

import Link from "next/link";
import type { Shipment } from "@/services/shipments/types";
import { Package, Clock, Navigation, CheckCircle, Truck as TruckIcon, AlertCircle } from "lucide-react";

export default function ShipmentCard({ s }: { s: Shipment }) {
  const badge = (() => {
    if (s.status === "delivered") return <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5 text-xs"><CheckCircle className="w-3.5 h-3.5"/> Delivered</span>;
    if (s.status === "out_for_delivery") return <span className="inline-flex items-center gap-1 text-sky-700 bg-sky-100 rounded-full px-2 py-0.5 text-xs"><TruckIcon className="w-3.5 h-3.5"/> In Transit</span>;
    if (s.status === "failed") return <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-100 rounded-full px-2 py-0.5 text-xs"><AlertCircle className="w-3.5 h-3.5"/> Failed</span>;
    return <span className="inline-flex items-center gap-1 text-gray-700 bg-gray-100 rounded-full px-2 py-0.5 text-xs">{s.status}</span>;
  })();

  return (
    <div className="border rounded-xl bg-white shadow-sm p-4 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4" />
          <span className="font-medium">Tracking ID: {s.id.slice(0,8)}…</span>
        </div>
        {badge}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
        <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/>Estimated Delivery: {s.eta ? new Date(s.eta).toLocaleDateString() : "-"}</div>
        <div className="flex items-center gap-1"><Navigation className="w-3.5 h-3.5"/>Method: {s.delivery_method}</div>
      </div>
      <div className="mt-3">
        <Link href={`/shipments/${s.id}`} className="text-primary-700 underline">View</Link>
      </div>
    </div>
  );
}


