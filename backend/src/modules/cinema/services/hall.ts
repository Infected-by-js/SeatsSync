import {prisma} from "@/core/db"
import {Errors} from "@/constants/errors"
import {ApiError} from "@/shared/errors/ApiError"

import type {HallPlan} from "../types"

export async function getHallPlan(hallId: number): Promise<HallPlan> {
  try {
    const hall = await prisma.hall.findUnique({
      where: {id: hallId},
      include: {
        seats: {
          include: {
            seatType: true,
          },
        },
      },
    })

    if (!hall) {
      throw new ApiError(Errors.HallNotFound)
    }

    return {
      id: hall.id,
      name: hall.name,
      canvas: {
        width: hall.canvasWidth,
        height: hall.canvasHeight,
      },
      rows: hall.rows,
      places: hall.places,
      seats: hall.seats.map((seat) => ({
        id: seat.id,
        seatType: seat.seatType.id,
        row: seat.row,
        place: seat.place,
        x: seat.x,
        y: seat.y,
        width: seat.width,
        height: seat.height,
        rotation: seat.rotation,
        status: seat.status,
      })),
    }
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(Errors.InternalServerError)
  }
}
