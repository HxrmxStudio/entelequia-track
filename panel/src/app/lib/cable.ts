"use client";
import { createConsumer } from "@rails/actioncable/app/assets/javascripts/actioncable.esm";

const CABLE_URL = process.env.NEXT_PUBLIC_CABLE_URL || "ws://localhost:3000/cable";
export const consumer = createConsumer(CABLE_URL);

export function subscribeRealtime(onMessage: (payload: unknown) => void) {
  return consumer.subscriptions.create({ channel: "RealtimeChannel" }, {
    received: (data: unknown) => onMessage(data)
  });
}
