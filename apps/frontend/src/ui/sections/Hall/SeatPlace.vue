<script setup lang="ts">
import {cn} from "@/utils/tailwindcss"
import BaseIcon from "@/ui/base/BaseIcon.vue"

import type {Seat} from "@seats-sync/types/cinema"

defineProps<{
  seat: Seat
  hovered?: boolean
  selected?: boolean
}>()
</script>

<template>
  <div
    class="border-accent/20 absolute flex items-center justify-center rounded-md border"
    :style="{
      width: seat.width + 'px',
      height: seat.height + 'px',
      left: seat.x + 'px',
      top: seat.y + 'px',
    }"
    :class="
      cn({
        'bg-primary-700/50 cursor-pointer': seat.status === 'VACANT',
        'bg-primary-300/50 cursor-default': seat.status === 'RESERVED',
        'bg-primary-700 cursor-pointer': selected,
      })
    "
    data-seat
    :data-row="seat.row"
    :data-place="seat.place"
    :data-seat-id="seat.id"
    :data-status="seat.status"
  >
    <span
      v-if="seat.status === 'VACANT'"
      class="text-content pointer-events-none flex cursor-default items-center justify-center transition-opacity duration-200 select-none"
      :class="{
        'opacity-100': hovered || selected,
        'opacity-0': !hovered,
      }"
    >
      {{ seat.place }}
    </span>
    <BaseIcon v-if="seat.status === 'RESERVED'" name="close" class="text-primary-700 size-4" />
  </div>
</template>
