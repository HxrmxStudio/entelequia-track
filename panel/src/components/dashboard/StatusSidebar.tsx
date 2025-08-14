"use client";

import { PackageCheck, Truck, WifiOff } from "lucide-react";

type Props = {
  gpsOffline: number;
  outForDelivery: number;
  deliveredToday: number;
};

export default function StatusSidebar({ gpsOffline, outForDelivery, deliveredToday }: Props) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <h2 className="font-semibold mb-3">SLA</h2>
      <div className="space-y-3 text-sm">
        <Row icon={<WifiOff className="w-4 h-4 text-gray-700" />} label="GPS offline" value={gpsOffline} />
        <Row icon={<Truck className="w-4 h-4 text-gray-700" />} label="En ruta" value={outForDelivery} />
        <Row icon={<PackageCheck className="w-4 h-4 text-gray-700" />} label="Entregas hoy" value={deliveredToday} />
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-gray-700">{icon}{label}</span>
      <b className="tabular-nums">{value}</b>
    </div>
  );
}


