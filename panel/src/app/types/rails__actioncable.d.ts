declare module "@rails/actioncable" {
  type Params = { channel: string }
  type Subscription = { unsubscribe(): void }
  type Callbacks = { received(data: unknown): void }

  interface Consumer {
    subscriptions: {
      create(params: Params, callbacks: Callbacks): Subscription
    }
  }

  const ActionCable: {
    createConsumer(url: string): Consumer
  }

  export default ActionCable
}