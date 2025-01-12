import {Errors} from "@/constants/errors"
import {DB} from "@/core/db"
import {ApiError} from "@/shared/errors/ApiError"

import type {Cinema} from "./types"

const cinemaDb = new DB("cinema")
const hallDb = new DB("hall")

export async function getAllCinemas(): Promise<Cinema[]> {
  const cinemasResult = await cinemaDb.findAll()
  if (!cinemasResult.success) {
    throw new ApiError(Errors.CinemaFetchFailed)
  }

  const cinemas = cinemasResult.data!

  // Get halls for each cinema
  const cinemasWithHalls = await Promise.all(
    cinemas.map(async (cinema) => {
      const hallsResult = await hallDb.findAll({
        where: {cinema_id: cinema.id},
        include: {
          _count: {
            select: {seats: true},
          },
        },
      })

      if (!hallsResult.success) {
        throw new ApiError(Errors.HallFetchFailed)
      }

      return {
        id: cinema.id,
        name: cinema.name,
        color: cinema.color,
        halls: hallsResult.data!.map((hall) => ({
          id: hall.id,
          name: hall.name,
          seatsCount: hall._count.seats,
        })),
      }
    }),
  )

  return cinemasWithHalls
}

export async function getCinemaById(id: number): Promise<Cinema> {
  const cinemaResult = await cinemaDb.findOne({id})
  if (!cinemaResult.success) {
    throw new ApiError(Errors.CinemaNotFound)
  }

  const cinema = cinemaResult.data!
  const hallsResult = await hallDb.findAll({
    where: {cinema_id: id},
    include: {
      _count: {
        select: {seats: true},
      },
    },
  })

  if (!hallsResult.success) {
    throw new ApiError(Errors.HallFetchFailed)
  }

  return {
    id: cinema.id,
    name: cinema.name,
    color: cinema.color,
    halls: hallsResult.data!.map((hall) => ({
      id: hall.id,
      name: hall.name,
      seatsCount: hall._count.seats,
    })),
  }
}
