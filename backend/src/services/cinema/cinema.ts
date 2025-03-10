import {cinemaModel} from "@/model/cinema"
import {Errors} from "@/constants/errors"
import {ApiError} from "@/shared/errors/ApiError"

import type {Cinema} from "@/model/cinema/types"

export async function getCinemas(): Promise<Cinema[]> {
  try {
    return await cinemaModel.getAll()
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(Errors.InternalServerError)
  }
}
