"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getOrderById } from "@/services/orders/getOrderById";
import type { OrderItem } from "@/services/orders/types";
// Removed useRequireAuth import - handled by (protected)/layout.tsx

export default function OrderDetailPage() {
  // No need for useRequireAuth() - already protected by (protected)/layout.tsx
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [order, setOrder] = useState<OrderItem | null>(null);

  useEffect(() => {
    (async () => { setOrder(await getOrderById(id)); })();
  }, [id]);

  if (!order) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Order</h1>
      <div className="border rounded-lg bg-white shadow-sm p-4 text-sm space-y-2">
        <div><b>ID:</b> {order.id}</div>
        <div><b>External Ref:</b> {order.external_ref ?? "-"}</div>
        <div><b>Status:</b> {order.status}</div>
        <div><b>Amount:</b> {order.amount_cents != null ? `$${(order.amount_cents/100).toFixed(2)} ${order.currency ?? ""}` : "-"}</div>
        <div><b>Channel:</b> {order.channel ?? "-"}</div>
        <div><b>Created:</b> {order.created_at ? new Date(order.created_at).toLocaleString() : "-"}</div>
        <div><b>Metadata:</b> <pre className="bg-gray-50 p-2 rounded overflow-auto">{JSON.stringify(order.metadata ?? {}, null, 2)}</pre></div>
      </div>
    </div>
  );
}


