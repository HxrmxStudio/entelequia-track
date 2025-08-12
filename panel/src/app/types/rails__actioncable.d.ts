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

declare module "@rails/actioncable/app/assets/javascripts/actioncable.esm" {
  import type { Consumer } from "@rails/actioncable"
  export function createConsumer(url: string): Consumer
}