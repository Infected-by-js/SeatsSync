<script setup lang="ts">
import {Carousel, Slide} from "vue3-carousel"
import {useDevice} from "@/composables/useDevice"

const {isTablet} = useDevice()

const slides = ["left", "right"]
</script>

<template>
  <div class="bg-primary-200 text-content flex h-full w-full flex-col gap-4 overflow-hidden p-8">
    <Carousel v-if="isTablet" class="layout-carousel" height="100%" :perPage="1">
      <Slide v-for="slide in slides" :key="slide" class="relative flex h-full flex-col gap-4">
        <slot :name="slide" />
      </Slide>
    </Carousel>

    <div v-else class="grid h-full grid-cols-[2fr_1fr] gap-4">
      <div v-for="slide in slides" :key="slide" :data-layout-section="slide" class="relative">
        <slot :name="slide" />
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
:deep(.layout-carousel) {
  height: 100%;

  & .carousel__viewport {
    height: 100%;
  }
}
</style>
