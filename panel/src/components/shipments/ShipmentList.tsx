"use client";

import type { Shipment } from "@/services/shipments/types";
import ShipmentCard from "./ShipmentCard";

export default function ShipmentList({ items }: { items: ReadonlyArray<Shipment> }) {
  if (!items.length) return <div className="text-sm text-gray-500">No shipments</div>;
  return (
    <div className="space-y-3">
      {items.map(s => (<ShipmentCard key={s.id} s={s} />))}
    </div>
  );
}


