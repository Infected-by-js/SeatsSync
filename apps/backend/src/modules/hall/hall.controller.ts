import {Subscriptions} from "@seats-sync/constants/subscriptions"
import {subscribe, unsubscribe} from "./hall.subscription"

import type {IWebSocketClient} from "@/core/ws"
import type {MessageRequest} from "@seats-sync/types/websocket"

export function onMessage(ws: IWebSocketClient, message: MessageRequest<any>) {
  switch (message.type) {
    case Subscriptions["hall.subscribe"]:
      subscribe(ws, message as MessageRequest<{id: number}>)
      return true
    case Subscriptions["hall.unsubscribe"]:
      unsubscribe(ws, message)
      return true
    default: {
      return false
    }
  }
}
