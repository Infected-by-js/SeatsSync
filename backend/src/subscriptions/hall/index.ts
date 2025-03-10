import {notifyUpdate, subscribe, unsubscribe} from "./hall"
import {IWebSocketClient} from "@/core/ws"
import {Subscription, Subscriptions} from "@/constants/messageTypes"
import {MessageRequest} from "@/shared/messages/types"

export {notifyUpdate, unsubscribe}

export function onMessage(ws: IWebSocketClient, message: MessageRequest<Subscription>) {
  switch (message.type) {
    case Subscriptions["hall.subscribe"]:
      subscribe(ws, message as MessageRequest<Subscription, {id: number}>)
      return true
    case Subscriptions["hall.unsubscribe"]:
      unsubscribe(ws, message)
      return true
    default: {
      return false
    }
  }
}
