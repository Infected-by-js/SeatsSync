import type {Cinema, Hall, Seat} from "@/types/cinema"

export type CinemaState = {
  cinemas: Cinema[]
  activeCinema: Cinema | null
  activeHall: Hall | null
  selectedSeats: Seat[]
  selectionLimit: number
}

export type CinemaActions = {
  setActiveCinema: (cinema: Cinema) => void
  setActiveHall: (hall: Hall) => void
  updateHallSeats: (updatedHall: Hall) => void
  toggleSeat: (seat: Seat) => void
  clearSelectedSeats: () => void
  purchaseSeats: () => Promise<void>
}

export type CinemaGetters = {
  availableSeats: Seat[]
  isHallSubscribed: boolean
  canSelectMoreSeats: boolean
}

export interface Seat {
  id: string
  row: number
  number: number
  status: SeatStatus
  type: SeatType
}

export interface Hall {
  id: string
  name: string
  seats: Seat[]
}

export interface Price {
  seatType: SeatType
  amount: number
}

export enum SeatType {
  Regular = "regular",
  VIP = "vip",
  Disabled = "disabled",
}

export enum SeatStatus {
  Available = "available",
  Selected = "selected",
  Occupied = "occupied",
  Reserved = "reserved",
}
