import {MessageRequest} from "@/core/ws/messages"
import {Subscription} from "@/constants/messageTypes"
import {SeatStatus} from "@/utils/types"

export type HallMessage = MessageRequest<Subscription>

export type Seat = {
  id: number
  row: number
  place: number
  status: SeatStatus
  seat_type: {
    name: string
    price: number
  }
}

export type Hall = {
  id: number
  name: string
  cinema_id: number
  created_at: string
  rows: number
  places: number
  seats: Seat[]
}
