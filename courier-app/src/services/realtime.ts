import actionCable, { type Cable, type Channel } from "@rails/actioncable";
import Constants from "expo-constants";

const CABLE_URL: string = (Constants.expoConfig?.extra?.cableUrl as string) ?? "ws://localhost:3001/cable";

export function connectRealtime(token?: string): Cable {
  const url = new URL(CABLE_URL);
  if (token) url.searchParams.set("token", token);
  return actionCable.createConsumer(url.toString());
}

export function subscribeRealtime(
  consumer: Cable,
  handlers: { onHello?: (data: unknown) => void }
): () => void {
  const channel: Channel = consumer.subscriptions.create({ channel: "RealtimeChannel" }, {
    received: (message: any) => {
      if (message?.type === "hello" && handlers.onHello) handlers.onHello(message.data);
    },
  });

  return () => consumer.subscriptions.remove(channel);
}


