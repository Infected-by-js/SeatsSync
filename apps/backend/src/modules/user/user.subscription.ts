import {Errors} from "@seats-sync/constants/errors"
import {publisher} from "@/core/pubsub"
import {formatError} from "@/core/ws/messages"

import type {IWebSocketClient} from "@/core/ws"
import type {Subscription} from "@seats-sync/constants/subscriptions"
import type {MessageRequest} from "@seats-sync/types/websocket"
import type {UserStatus} from "./user.types"

const subscription = publisher.register({
  name: "user.subscribe",

  async prepareSnapshot(ws: IWebSocketClient) {
    const isAuthenticated = ws.context.isAuthenticated()
    const username = ws.context.username()

    return serialize(isAuthenticated ? "user" : "guest", username)
  },
})

export function subscribe(ws: IWebSocketClient, message: MessageRequest<Subscription>) {
  return subscription.subscribe(ws, message)
}

export function unsubscribe(ws: IWebSocketClient, message?: MessageRequest<{sub_eid?: string}>) {
  if (!message) {
    subscription.unsubscribe(ws.context.id)
    return
  }

  if (!message?.data?.sub_eid) ws.send(formatError({eid: message?.eid, error: Errors.SubscriptionNotFound}))
  else subscription.unsubscribe(ws.context.id, message.data.sub_eid)
}

export function notifyUpdate({status, username}: {status: UserStatus; username?: string}) {
  subscription.notify("update", serialize(status, username))
}

function serialize(status: UserStatus, username: string) {
  return status === "user" ? {status, username} : {status}
}
