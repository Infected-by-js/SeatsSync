import {Errors} from "@/constants/errors"
import {ApiError} from "@/shared/errors/ApiError"
import {subscriptionManager} from "@/shared/subscriptions/manager"

import type {MessageHandler} from "@/shared/messages/types"
import type {SubscribeCinemaRequest} from "./types"

export const subscribeCinema: MessageHandler<SubscribeCinemaRequest, void> = async (data, {eid}, ws) => {
  const cinemaId = data.id
  const subscriptionKey = `cinema:${cinemaId}`

  subscriptionManager.subscribe(subscriptionKey, ws)
}
