declare module "@rails/actioncable" {
  export interface Channel {
    unsubscribe?: () => void;
  }

  export interface Subscriptions {
    create(
      params: { channel: string },
      callbacks: { received?: (data: unknown) => void }
    ): Channel;
    remove(channel: Channel): void;
  }

  export interface Cable {
    subscriptions: Subscriptions;
  }

  const actionCable: {
    createConsumer(url: string): Cable;
  };

  export default actionCable;
}


