"use client";
import { createConsumer } from "@rails/actioncable/app/assets/javascripts/actioncable.esm";

const CABLE_URL = process.env.NEXT_PUBLIC_CABLE_URL || "ws://localhost:3000/cable";
export const consumer = createConsumer(CABLE_URL);

export type RealtimeUnsub = () => void;

type SubscribeParams =
  | { onMessage: (payload: unknown) => void; topics?: string[] }
  | ((payload: unknown) => void);

export function subscribeRealtime(params: SubscribeParams): RealtimeUnsub {
  const onMessage = typeof params === "function" ? params : params.onMessage;
  const topics = typeof params === "function" ? undefined : params.topics;
  const sub = consumer.subscriptions.create(
    { channel: "RealtimeChannel", topics },
    { received: (data: unknown) => onMessage(data) }
  );
  return () => { try { sub?.unsubscribe?.(); } catch {} };
}
