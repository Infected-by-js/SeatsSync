export type Cinema = {
  id: number
  name: string
  color: string
  created_at: Date
  halls: Hall[]
}

export type Hall = {
  id: number
  cinema_id: number
  name: string
  rows: number
  places: number
  seats: Seat[]
}

export type Seat = {
  id: number
  hall_id: number
  row: number
  place: number
  status: SeatStatus
  created_at: Date
  x: number
  y: number
  width: number
  height: number
  rotation: number
}

export type SeatStatus = "free" | "occupied"

export type CinemaResponse = {
  data: Cinema[]
}

export type HallResponse = {
  data: Hall
}

export type WebSocketMessage<T = unknown> = {
  type: string
  data: T
  eid?: string
}

export type WebSocketResponse<T = unknown> = {
  data: T
  error?: string
}
