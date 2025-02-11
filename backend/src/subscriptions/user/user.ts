import {UserStatus} from "model/user"
import {publisher} from "@/core/pubsub"
import {IWebSocketClient} from "@/core/ws"
import {Errors} from "@/constants/errors"
import {UserSubscriptions} from "@/constants/messageTypes"
import {formatError} from "@/shared/messages/formatters"
import {MessageRequest} from "@/shared/messages/types"

type UserSubscription = keyof typeof UserSubscriptions

const userSubscription = publisher.register({
  name: "user.subscribe",

  async onSnapshot(ws: IWebSocketClient) {
    const isAuthenticated = ws.context.isAuthenticated()
    const username = ws.context.username()

    return serialize(isAuthenticated ? "user" : "guest", username)
  },
})

export function subscribeUser(ws: IWebSocketClient, message: MessageRequest<UserSubscription>) {
  return userSubscription.subscribe(ws, message)
}

export function unsubscribeUser(ws: IWebSocketClient, eid?: string) {
  userSubscription.unsubscribe(ws.context.id, eid)
}

export function notifyUserUpdate({status, username}: {status: UserStatus; username?: string}) {
  userSubscription.notify("update", serialize(status, username))
}

function serialize(status: UserStatus, username: string) {
  return status === "user" ? {status, username} : {status}
}
