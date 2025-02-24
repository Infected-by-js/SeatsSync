import {ref} from "vue"
import {tryOnBeforeUnmount} from "@vueuse/core"

import type {Observable, Subscription} from "rxjs"

const subscriptions = new Set<Subscription>()

type SubscribeOptions<T> = {
  onError?: (error: any) => void
  transform?: (value: T) => T
}

/**
 * Creates a ref and subscribes to an Observable
 * @param observable - Observable to subscribe to
 * @param initialValue - Initial value for the ref
 */
export function onSubscribe<T>(observable: Observable<T>, initialValue: T, options: SubscribeOptions<T> = {}) {
  const value = ref<T>(initialValue)

  const subscription = observable.subscribe({
    next: (newValue) => {
      value.value = options.transform ? options.transform(newValue) : newValue
    },
    error: options.onError,
  })

  subscriptions.add(subscription)

  tryOnBeforeUnmount(() => {
    subscription.unsubscribe()
    subscriptions.delete(subscription)
  })

  return value
}
