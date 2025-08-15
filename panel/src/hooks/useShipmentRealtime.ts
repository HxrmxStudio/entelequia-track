// panel/src/app/shipments/[id]/useShipmentRealtime.ts
'use client';
import { useEffect } from 'react';
import { subscribeRealtime, type RealtimeUnsub } from '@/app/lib/cable';

export type ProofCreated = {
  shipment_id: string | number;
  proof: { id: string; kind: string; lat: number; lon: number; taken_at?: string };
  shipment?: { status?: string; delivered_at?: string };
};

type Handler = {
  onProofCreated?: (evt: ProofCreated) => void;
  onOtherEvent?: (raw: any) => void; // opcional
};

export function useShipmentRealtime(shipmentId: string | number, handlers: Handler) {
  useEffect(() => {
    if (!shipmentId) return;

    const topic = `shipments:${shipmentId}`;
    const unsub: RealtimeUnsub = subscribeRealtime({
      topics: [topic],
      onMessage: (msg: any) => {
        // Esperamos { type, payload }
        if (!msg) return;
        if (msg.type === 'proof.created' && handlers.onProofCreated) {
          handlers.onProofCreated(msg.payload as ProofCreated);
          return;
        }
        handlers.onOtherEvent?.(msg);
      },
      // opcionales según tu cable.ts: onOpen, onClose, onError...
    });

    return () => unsub?.();
  }, [shipmentId, handlers]);
}
