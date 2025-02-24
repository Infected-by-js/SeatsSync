<script setup lang="ts">
import {computed} from "vue"
import {useCinemaStore} from "@/stores/cinema/cinema.store"
import {seatsStore} from "@/stores/cinema/seats.store"
import {getSeatRowChar} from "@/utils/hall"
import {onSubscribe} from "@/composables/useSubscriptions"
import BaseButton from "@/ui/base/BaseButton.vue"

import type {Seat} from "@/stores/cinema/types"

const cinemaStore = useCinemaStore()
const selectedSeats = onSubscribe(seatsStore.selectedSeats$, [])
const totalPrice = onSubscribe(seatsStore.totalPrice$, 0)
const isLoading = onSubscribe(seatsStore.isLoading$, false)
const error = onSubscribe(seatsStore.error$, null)

// Вычисляемые свойства для отображения информации
const formattedTotalPrice = computed(() => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
  }).format(totalPrice.value)
})

const selectedSeatsCount = computed(() => selectedSeats.value.length)

// Методы для работы с местами
const handleSeatSelect = (seat: Seat) => {
  seatsStore.selectSeat(seat)
}

const handleSeatUnselect = (seatId: string) => {
  seatsStore.unselectSeat(seatId)
}

const handleClearSelection = () => {
  seatsStore.clearSelection()
}

const hallName = computed(() => `${cinemaStore.activeHall?.name} ${cinemaStore.activeCinema?.name}`)
const seats = computed(() => cinemaStore.selectedSeats.map((seat: Seat) => `${getSeatRowChar(seat.row)}${seat.place}`).join(", "))

async function onPurchase() {
  try {
    isLoading.value = true
    console.log("purchase")
    // await cinemaStore.purchaseSeats()
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div v-if="cinemaStore.activeHall" class="booking">
    <div v-if="isLoading" class="booking__loader">Загрузка...</div>

    <div v-else-if="error" class="booking__error">
      {{ error }}
    </div>

    <template v-else>
      <div class="booking__summary">
        <h2>Выбранные места</h2>
        <div class="booking__selected-seats">
          <div v-if="selectedSeatsCount === 0" class="booking__no-seats">Места не выбраны</div>
          <div v-else>
            <div v-for="seat in selectedSeats" :key="seat.id" class="booking__seat">
              Ряд {{ seat.row }}, Место {{ seat.number }}
              <button @click="handleSeatUnselect(seat.id)" class="booking__seat-remove">Убрать</button>
            </div>
          </div>
        </div>

        <div class="booking__total" v-if="selectedSeatsCount > 0">
          <div class="booking__count">Выбрано мест: {{ selectedSeatsCount }}</div>
          <div class="booking__price">Итого: {{ formattedTotalPrice }}</div>
          <button @click="handleClearSelection" class="booking__clear">Очистить выбор</button>
        </div>
      </div>

      <div class="ml-auto flex w-2/3 gap-2">
        <BaseButton variant="outline" @click="cinemaStore.clearSelectedSeats">Cancel</BaseButton>
        <BaseButton variant="accent" :disabled="!cinemaStore.selectedSeats.length || isLoading" :loading="isLoading" @click="onPurchase">
          Purchase
        </BaseButton>
      </div>
    </template>
  </div>

  <div v-else class="flex size-full items-center justify-center">Please choose a hall first</div>
</template>

<style scoped>
.booking {
  padding: 20px;
}

.booking__loader,
.booking__error {
  text-align: center;
  padding: 20px;
}

.booking__error {
  color: red;
}

.booking__summary {
  max-width: 400px;
  margin: 0 auto;
}

.booking__selected-seats {
  margin: 20px 0;
}

.booking__seat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.booking__seat-remove {
  color: red;
  border: none;
  background: none;
  cursor: pointer;
}

.booking__total {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #eee;
}

.booking__price {
  font-size: 1.2em;
  font-weight: bold;
  margin: 10px 0;
}

.booking__clear {
  width: 100%;
  padding: 10px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.booking__clear:hover {
  background-color: #d32f2f;
}

.booking__no-seats {
  text-align: center;
  color: #666;
  padding: 20px;
}
</style>
