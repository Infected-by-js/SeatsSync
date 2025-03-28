<script setup lang="ts">
import {ref} from "vue"
import {useRouter} from "vue-router"
import {invoke, until} from "@vueuse/core"
import {useCinemaStore} from "@/stores/cinema"
import BaseCard from "@/ui/base/BaseCard.vue"
import BaseIcon from "@/ui/base/BaseIcon.vue"
import PanelHallSelect from "@/ui/common/PanelHallSelect.vue"
import {useReserveSeatModal} from "@/ui/popovers/modals/ReserveSeat"
import Scheme from "./fragments/Scheme.vue"
import SchemeInfo from "./fragments/SchemeInfo.vue"

import type {Cinema, HallInCinema, Seat} from "@seats-sync/types/cinema"

const router = useRouter()
const cinemaStore = useCinemaStore()

const {isOpened, open, close} = useReserveSeatModal()

const hoveredSeat = ref<Seat | null>(null)

function onHoverSeat(seat: Seat | null) {
  if (isOpened.value) {
    hoveredSeat.value = null
    return
  }
  hoveredSeat.value = seat
}

function onSelectCinema(cinema: Cinema) {
  cinemaStore.onSelectCinema(cinema)
  cinemaStore.onSelectHall(cinema.halls[0].id)
}

function onSelectHall(hall: HallInCinema) {
  if (hall.id === cinemaStore.activeHall?.id) return
  cinemaStore.onSelectHall(hall.id)
  close()
}

function onSelectSeat(seat: Seat) {
  if (!seat || seat.status === "RESERVED") return
  hoveredSeat.value = null
  open(cinemaStore.activeHall?.id, seat)
}

invoke(async () => {
  await until(() => cinemaStore.isCinemaLoaded).toBeTruthy()
  router.routeLoaded()
})
</script>

<template>
  <section class="text-content flex size-full flex-col gap-3">
    <div class="px-3 pt-3">
      <BaseCard class="flex w-full h-fit" :loading="!cinemaStore.activeCinema">
        <PanelHallSelect
          v-if="cinemaStore.activeCinema"
          :cinemas="cinemaStore.cinemas"
          :active-cinema="cinemaStore.activeCinema"
          :active-hall="cinemaStore.activeHall"
          @select-hall="onSelectHall"
          @select-cinema="onSelectCinema"
        />
      </BaseCard>
    </div>

    <div class="flex-1 flex items-center justify-center overflow-auto px-3 pb-3">
      <BaseCard :loading="!cinemaStore.activeHall" data-hall class="relative">
        <div v-if="cinemaStore.activeHall" class="flex size-full flex-col items-center justify-center gap-2">
          <div class="flex size-full flex-col items-center gap-6">
            <div class="flex flex-col items-center justify-center gap-2 w-full">
              <h3 class="text-content flex items-center gap-1"><BaseIcon name="cinema" class="size-4" /> {{ cinemaStore.activeCinema?.name }}</h3>
              <p class="text-content flex items-center gap-1"><BaseIcon name="hall" class="size-4" /> {{ cinemaStore.activeHall.name }}</p>
            </div>

            <Scheme
              :seats="cinemaStore.activeHall.seats"
              :hovered-seat="hoveredSeat"
              :stop-hover="isOpened"
              @hover-seat="onHoverSeat"
              @select-seat="onSelectSeat"
            />
            <SchemeInfo />
          </div>
        </div>

        <div v-else class="flex size-full items-center justify-center">Please choose a hall first</div>
      </BaseCard>
    </div>
  </section>
</template>
