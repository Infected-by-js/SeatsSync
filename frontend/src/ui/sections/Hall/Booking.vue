<script setup lang="ts">
import {computed, ref} from "vue"
import {getSeatRowChar} from "@/utils/hall"
import {useWebSocket} from "@/composables/useWebSocket"
import {useCinemaStore} from "@/stores/cinema/cinema.store"
import BaseButton from "@/ui/base/BaseButton.vue"
import {useBookingTicketsModal} from "@/ui/modals/BookingTickets"

const cinemaStore = useCinemaStore()

const {subscribe} = useWebSocket()
const {open} = useBookingTicketsModal()

const isBooking = ref(false)
const seats = computed(() => cinemaStore.selectedSeats.map((seat) => `${getSeatRowChar(seat.row)}${seat.place}`).join(", "))
const total = computed(() => cinemaStore.selectedSeats.reduce((acc, seat) => acc + seat.seat_type.price, 0))
const isDisabled = computed(() => isBooking.value || !cinemaStore.selectedSeats.length)

async function onPurchase() {
  isBooking.value = true
  const {isCanceled} = await open()
  isBooking.value = false

  if (!isCanceled) {
    subscribe({
      msg: {
        type: "booking.purchase",
        data: {
          hall_id: cinemaStore.activeHall?.id,
          seat_ids: cinemaStore.selectedSeats.filter((seat) => seat.status === "free").map((seat) => seat.id),
        },
      },
      onResult: () => {
        cinemaStore.onClearSelectedSeats()
        isBooking.value = false
      },
      onError: () => {
        isBooking.value = false
      },
    })
  }
}
</script>

<template>
  <div class="flex flex-col gap-4" data-testid="booking-section">
    <div class="text-content/60 flex flex-col gap-2 text-sm">
      <div class="flex justify-between">
        <span class="">Seats</span>
        <span class="text-content font-bold">{{ seats.length ? seats : "-" }}</span>
      </div>
      <div class="flex justify-between">
        <span class="">Total</span>
        <span class="text-content font-bold">${{ total }}</span>
      </div>
    </div>

    <div class="flex w-full items-center justify-between gap-2">
      <BaseButton variant="outline" icon="minus-circle" class="w-1/3" size="sm" @click="cinemaStore.onClearSelectedSeats" :disabled="isDisabled">
        Cancel
      </BaseButton>
      <BaseButton variant="accent" icon="ticket" class="w-2/3" size="sm" @click="onPurchase" :disabled="isDisabled">Purchase</BaseButton>
    </div>
  </div>
</template>
