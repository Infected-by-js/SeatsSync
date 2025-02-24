<script setup lang="ts">
import {tryOnBeforeUnmount} from "@vueuse/core"
import {wsClient} from "@/api/ws"
import {toast, ToastsLiteProvider} from "@/lib/toasts-lite"
import BaseCard from "@/ui/base/BaseCard.vue"
import SeatsBooking from "@/ui/features/booking/Booking.vue"
import HallView from "@/ui/features/hall/Hall.vue"
import AppLayout from "@/ui/layouts/AppLayout.vue"
import Header from "@/ui/sections/Header.vue"

let toastID: string

wsClient.connectionState.subscribe(({state, prevState}) => {
  if (state === "RECONNECTING") toastID = toast.loading("Connecting...", {id: toastID, autoClose: false})
  else if (state === "CONNECTED" && prevState === "RECONNECTING") toast.success("Connected", {id: toastID, autoClose: true})
  else if (state === "DISCONNECTED" && prevState === "RECONNECTING") toast.error("Connection failed", {id: toastID, autoClose: true})
})

wsClient.on("*", "error").subscribe(({error}) => {
  if (!error) return
  toast.error(error)
})

tryOnBeforeUnmount(() => wsClient.destroy())
</script>

<template>
  <AppLayout>
    <template #header>
      <Header />
    </template>

    <template #left>
      <BaseCard class="flex-1">
        <HallView />
      </BaseCard>

      <BaseCard class="h-1/4">
        <SeatsBooking />
      </BaseCard>
    </template>

    <template #right>
      <BaseCard class=""> Logs </BaseCard>
    </template>
  </AppLayout>

  <ToastsLiteProvider />
</template>
