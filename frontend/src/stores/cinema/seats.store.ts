import {BehaviorSubject, combineLatest, Observable, Subject, timer} from "rxjs"
import {distinctUntilChanged, map, shareReplay, switchMap, takeUntil} from "rxjs/operators"
import {SeatStatus} from "./types"

import type {Hall, Price, Seat} from "./types"

export class SeatsStore {
  // Private subjects
  private readonly selectedSeats = new BehaviorSubject<Seat[]>([])
  private readonly loading = new BehaviorSubject<boolean>(false)
  private readonly error = new BehaviorSubject<string | null>(null)
  private readonly activeHall = new BehaviorSubject<Hall | null>(null)
  private readonly prices = new BehaviorSubject<Price[]>([])
  private readonly destroy = new Subject<void>()

  // Public observables
  public readonly selectedSeats$ = this.selectedSeats.asObservable()
  public readonly isLoading$ = this.loading.asObservable()
  public readonly error$ = this.error.asObservable()
  public readonly activeHall$ = this.activeHall.asObservable()
  public readonly prices$ = this.prices.asObservable()

  // Computed streams
  public readonly totalPrice$ = combineLatest([this.selectedSeats$, this.prices$]).pipe(
    map(([seats, prices]) => this.calculateTotalPrice(seats, prices)),
    distinctUntilChanged(),
    shareReplay(1),
  )

  public readonly hallSeats$ = this.activeHall$.pipe(
    map((hall) => hall?.seats || []),
    distinctUntilChanged(),
    shareReplay(1),
  )

  constructor() {
    // Автоматическая отмена бронирования через 5 минут
    this.selectedSeats$
      .pipe(
        switchMap((seats) => {
          if (seats.length) {
            return timer(5 * 60 * 1000).pipe(map(() => this.clearSelection()))
          }
          return []
        }),
        takeUntil(this.destroy),
      )
      .subscribe()
  }

  // Методы для изменения состояния
  public selectSeat(seat: Seat): void {
    if (seat.status !== SeatStatus.Available) {
      this.setError("Это место недоступно для выбора")
      return
    }

    const current = this.selectedSeats.value
    if (current.find((s) => s.id === seat.id)) {
      return
    }

    this.selectedSeats.next([
      ...current,
      {
        ...seat,
        status: SeatStatus.Selected,
      },
    ])
    this.clearError()
  }

  public unselectSeat(seatId: string): void {
    const current = this.selectedSeats.value
    this.selectedSeats.next(current.filter((seat) => seat.id !== seatId))
  }

  public setActiveHall(hall: Hall): void {
    this.activeHall.next(hall)
    this.clearSelection()
    this.loadPrices(hall.id)
  }

  public clearSelection(): void {
    this.selectedSeats.next([])
    this.clearError()
  }

  // Private helpers
  private calculateTotalPrice(seats: Seat[], prices: Price[]): number {
    return seats.reduce((total, seat) => {
      const price = prices.find((p) => p.seatType === seat.type)?.amount || 0
      return total + price
    }, 0)
  }

  private async loadPrices(hallId: string): Promise<void> {
    try {
      this.loading.next(true)
      // const response = await api.getPrices(hallId);
      // this.prices.next(response.data);
    } catch (error) {
      this.setError("Ошибка при загрузке цен")
    } finally {
      this.loading.next(false)
    }
  }

  private setError(message: string): void {
    this.error.next(message)
  }

  private clearError(): void {
    this.error.next(null)
  }

  public destroy(): void {
    this.destroy.next()
    this.destroy.complete()
  }
}

// Создаем синглтон
export const seatsStore = new SeatsStore()
