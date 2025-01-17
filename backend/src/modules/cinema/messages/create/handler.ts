import {Errors} from "@/constants/errors"
import {DB} from "@/core/db"
import {ApiError} from "@/shared/errors/ApiError"
import {subscriptionManager} from "@/shared/subscriptions/manager"

import type {MessageHandler} from "@/shared/messages/types"
import type {CreateCinemaRequest, CreateCinemaResponse} from "./types"

const cinemaDb = new DB("cinema")

export const createCinema: MessageHandler<CreateCinemaRequest, CreateCinemaResponse> = async (data) => {
  const result = await cinemaDb.create({
    data: {
      name: data.name,
      color: data.color,
    },
  })

  if (!result.success) {
    throw new ApiError(Errors.CinemaCreateFailed)
  }

  const cinema = {
    id: result.data!.id,
    name: result.data!.name,
    color: result.data!.color,
    halls: [],
  }

  // Notify subscribers about the new cinema
  subscriptionManager.publish(`cinema:${cinema.id}`, cinema, "cinema.update")

  return cinema
}
