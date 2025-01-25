import {ref} from "vue"
import {tryOnBeforeUnmount} from "@vueuse/core"
import {BehaviorSubject} from "rxjs"
import {takeUntil} from "rxjs/operators"
import {Subscription, wsClient} from "@/modules/ws"

import type {ConnectionState, RequestMessage, SubscriptionInstance, SubscriptionOptions} from "@/modules/ws"
import type {Ref} from "vue"

type UseWebSocketReturn = {
  connectionState: Ref<ConnectionState>
  subscriptions: Ref<Map<string, SubscriptionInstance>>
  subscribe: (options: SubscriptionOptions) => SubscriptionInstance["unsubscribe"]
  unsubscribe: (id: string) => void
  resubscribe: (id: string) => void
  send: <T = any>(message: RequestMessage<T>) => Promise<T>
}

export function useWebSocket(): UseWebSocketReturn {
  const connectionState = ref(wsClient.state)
  const subscriptions = ref(new Map<string, SubscriptionInstance>())
  const destroy$ = new BehaviorSubject<boolean>(false)

  const connectionStateSubscription = wsClient.connectionState.pipe(takeUntil(destroy$)).subscribe(({state}) => {
    connectionState.value = state
  })

  function subscribe(options: SubscriptionOptions): SubscriptionInstance["unsubscribe"] {
    const subscription = new Subscription(options)

    subscriptions.value.set(subscription.id, subscription)

    return () => subscription.unsubscribe()
  }

  function unsubscribe(id: string) {
    const subscription = subscriptions.value.get(id)
    if (!subscription) return

    subscription.unsubscribe()
    subscriptions.value.delete(id)
  }

  function resubscribe(id: string) {
    const subscription = subscriptions.value.get(id)
    if (!subscription) return

    subscription.resubscribe()
  }

  async function send<T = any>(message: RequestMessage<T>): Promise<T> {
    try {
      return await Subscription.request<T>(message)
    } catch (error) {
      console.error("Error sending message:", message, error)
      throw error
    }
  }

  function cleanup() {
    destroy$.next(true)
    destroy$.complete()

    connectionStateSubscription.unsubscribe()

    subscriptions.value.forEach((sub) => sub.unsubscribe())
    subscriptions.value.clear()
  }

  tryOnBeforeUnmount(cleanup)

  return {
    connectionState,
    subscriptions,
    subscribe,
    unsubscribe,
    resubscribe,
    send,
  }
}
