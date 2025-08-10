"use client";
import cable from "@rails/actioncable";

const CABLE_URL = process.env.NEXT_PUBLIC_CABLE_URL || "ws://localhost:3001/cable";
export const consumer = cable.createConsumer(CABLE_URL);

export function subscribeRealtime(onMessage: (payload: unknown) => void) {
  return consumer.subscriptions.create({ channel: "RealtimeChannel" }, {
    received: (data: unknown) => onMessage(data)
  });
}
