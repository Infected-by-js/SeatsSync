import type {Seat} from "@/types/cinema"

const SEAT_SIZE = 30
const SEAT_GAP = 5
const ROW_GAP = 15

/**
 * Get the character for a row
 * @param row - The row number; Starts from 1
 * @returns The character for the row
 * @example
 * getSeatRowChar(1) // "A"
 * getSeatRowChar(26) // "Z"
 * getSeatRowChar(27) // "AA"
 * getSeatRowChar(52) // "AZ"
 */
export function getSeatRowChar(row: number): string {
  return String.fromCharCode(65 + row - 1)
}

/**
 * Create a matrix of seats
 * @param seats - The seats to create the matrix from
 * @returns The matrix of seats sorted by row and place
 */
export function createSeatsSchema(seats: Seat[]): Seat[][] {
  if (!seats.length) return []

  const maxRow = Math.max(...seats.map((seat) => seat.row))
  const maxPlace = Math.max(...seats.map((seat) => seat.place))

  const schema: Seat[][] = []

  for (let row = 1; row <= maxRow; row++) {
    const rowSeats = seats
      .filter((seat) => seat.row === row)
      .map((seat) => ({
        ...seat,
        x: (seat.place - 1) * (SEAT_SIZE + SEAT_GAP),
        y: (seat.row - 1) * (SEAT_SIZE + ROW_GAP),
        width: SEAT_SIZE,
        height: SEAT_SIZE,
        rotation: 0,
      }))
      .sort((a, b) => a.place - b.place)

    schema.push(rowSeats)
  }

  return schema
}

/**
 * Calculate the size of the hall
 * @param seats - The seats to calculate the size from
 * @returns The width and height of the hall
 */
export function calculateHallSize(seats: Seat[]): {width: number; height: number} {
  if (!seats.length) return {width: 0, height: 0}

  const maxRow = Math.max(...seats.map((seat) => seat.row))
  const maxPlace = Math.max(...seats.map((seat) => seat.place))

  return {
    width: maxPlace * (SEAT_SIZE + SEAT_GAP),
    height: maxRow * (SEAT_SIZE + ROW_GAP),
  }
}
