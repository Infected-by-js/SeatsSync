import {Errors} from "@seats-sync/constants/errors"
import {WebSocket} from "ws"
import {formatError, formatSuccess} from "@/core/ws/messages"
import {logger} from "@/shared/lib/logger"

import type {IWebSocketClient} from "@/core/ws"
import type {ErrorCode} from "@seats-sync/constants/errors"
import type {MessageRequest, ResponseStatus} from "@seats-sync/types/websocket"
import type {Subscriber as ISubscriber, SubscriptionHandler} from "./types"

export class Subscriber<D = any> {
  private subscribers = new Map<string, ISubscriber>()

  private compositeKey(clientId: string, eid: string) {
    return `${clientId}::${eid}`
  }

  constructor(private handler: SubscriptionHandler<D>) {}

  async subscribe(ws: IWebSocketClient, message: MessageRequest<D>) {
    try {
      const clientId = ws.context?.id

      if (!clientId) {
        ws.send(formatError({eid: message?.eid, error: Errors.Unauthorized}))
        return
      }

      const subKey = this.compositeKey(clientId, message.eid)

      if (this.subscribers.has(subKey)) {
        ws.send(formatError({eid: message.eid, error: Errors.SubscriptionAlreadyExists}))
        return
      }

      const snapshot = await this.handler.prepareSnapshot(ws, message)

      ws.send(formatSuccess({eid: message.eid, status: "snapshot", type: this.handler.name, data: snapshot}))

      this.subscribers.set(subKey, {ws, eid: message.eid})

      logger.info(`Client subscribed to ${this.handler.name}`, {clientId, eid: message.eid})
    } catch (error) {
      ws.send(formatError({eid: message.eid, error: Errors.InternalServerError}))
      logger.error(`Failed to handle ${this.handler.name} subscription`, {error: (error as Error).message})
    }
  }

  unsubscribe(clientId: string, eid?: string) {
    // NOTE: if eid is not provided, unsubscribe from all subscriptions
    if (!eid) {
      for (const key of this.subscribers.keys()) {
        if (key.split("::")[0] === clientId) {
          this.subscribers.delete(key)
        }
      }
      return
    }

    this.subscribers.delete(this.compositeKey(clientId, eid))
  }

  notify<T = any>(status: Extract<ResponseStatus, "update" | "error">, message: T | ErrorCode) {
    this.subscribers.forEach((subscriber, clientId) => {
      const {ws, eid} = subscriber

      if (ws.readyState === WebSocket.OPEN) {
        try {
          if (status === "update") ws.send(formatSuccess({eid, type: this.handler.name, status: "update", data: message as T}))
          else ws.send(formatError({eid, type: this.handler.name, error: message as ErrorCode}))
        } catch (error) {
          logger.error(`Failed to notify client for ${this.handler.name}`, {error: (error as Error).message, clientId, eid})
        }
      } else {
        this.subscribers.delete(clientId)
      }
    })
  }
}
