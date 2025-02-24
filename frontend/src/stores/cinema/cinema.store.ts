import {computed, ref} from "vue"
import {tryOnBeforeUnmount} from "@vueuse/core"
import {defineStore} from "pinia"
import {toast} from "@/lib/toasts-lite"
import {useWebSocket} from "@/composables/useWebSocket"

import type {Cinema, Hall, Seat} from "@/types/cinema"

export const useCinemaStore = defineStore("cinema", () => {
  const {subscribe} = useWebSocket()
  let unsubscribeFromHall: (() => void) | null = null

  // State
  const cinemas = ref<Cinema[]>([])
  const activeCinema = ref<Cinema | null>(null)
  const activeHall = ref<Hall | null>(null)
  const selectedSeats = ref<Seat[]>([])
  const selectionLimit = ref<number>(5)

  // Getters
  const availableSeats = computed(() => activeHall.value?.seats.filter((seat) => seat.status === "free") ?? [])
  const isHallSubscribed = computed(() => Boolean(activeHall.value))
  const canSelectMoreSeats = computed(() => selectedSeats.value.length < selectionLimit.value)

  // WebSocket subscriptions
  const unsubscribeCinemas = subscribe<Cinema[]>({
    msg: {type: "cinemas.get"},
    onResult: ({data}) => {
      cinemas.value = data
      if (data.length > 0 && !activeCinema.value) {
        setActiveCinema(data[0])
      }
    },
    onError: (error) => {
      toast.error(error)
      console.error(error)
    },
  })

  function setActiveCinema(cinema: Cinema) {
    activeCinema.value = cinema
    if (cinema.halls.length > 0) {
      setActiveHall(cinema.halls[0])
    }
  }

  function setActiveHall(hall: Hall) {
    if (unsubscribeFromHall) {
      unsubscribeFromHall()
      unsubscribeFromHall = null
    }

    activeHall.value = hall
    unsubscribeFromHall = subscribe<Hall>({
      msg: {type: "hall.subscribe", data: {id: hall.id}},
      onResult: ({data}) => {
        updateHallSeats(data)
      },
      onError: (error) => {
        toast.error(error)
        console.error(error)
      },
    })
  }

  function updateHallSeats(updatedHall: Hall) {
    if (activeHall.value && activeHall.value.id === updatedHall.id) {
      activeHall.value = updatedHall
    }
  }

  function toggleSeat(seat: Seat) {
    const index = selectedSeats.value.findIndex((s) => s.id === seat.id)
    if (index === -1 && canSelectMoreSeats.value) {
      selectedSeats.value.push(seat)
    } else if (index !== -1) {
      selectedSeats.value.splice(index, 1)
    }
  }

  function clearSelectedSeats() {
    selectedSeats.value = []
  }

  async function purchaseSeats() {
    if (!activeHall.value || !selectedSeats.value.length) return

    try {
      const result = await subscribe<void>({
        msg: {
          type: "seats.purchase",
          data: {
            hallId: activeHall.value.id,
            seatIds: selectedSeats.value.map((seat) => seat.id),
          },
        },
        onError: (error) => {
          throw new Error(error)
        },
      })

      clearSelectedSeats()
      toast.success("Tickets purchased successfully")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to purchase tickets"
      toast.error(message)
      console.error(err)
    }
  }

  // Cleanup
  tryOnBeforeUnmount(() => {
    unsubscribeCinemas()
    if (unsubscribeFromHall) {
      unsubscribeFromHall()
    }
  })

  return {
    // State
    cinemas,
    activeCinema,
    activeHall,
    selectedSeats,
    selectionLimit,

    // Getters
    availableSeats,
    isHallSubscribed,
    canSelectMoreSeats,

    // Actions
    setActiveCinema,
    setActiveHall,
    updateHallSeats,
    toggleSeat,
    clearSelectedSeats,
    purchaseSeats,
  }
})
