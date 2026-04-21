<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import CenteredContent from '~/components/common/layouts/CenteredContent.vue'
import BaseCard from '~/components/common/cards/BaseCard.vue'
import BaseButton from '~/components/common/buttons/BaseButton.vue'

let redirectTimer: number | undefined
let countdownTimer: number | undefined

const secondsLeft = ref(10)

onMounted(() => {
  redirectTimer = window.setTimeout(() => {
    window.location.assign('/')
  }, 10_000)

  countdownTimer = window.setInterval(() => {
    secondsLeft.value = Math.max(0, secondsLeft.value - 1)
  }, 1000)
})

onBeforeUnmount(() => {
  if (redirectTimer !== undefined) window.clearTimeout(redirectTimer)
  if (countdownTimer !== undefined) window.clearInterval(countdownTimer)
})
</script>

<template>
  <Head title="Erreur serveur" />

  <CenteredContent maxWidthClass="max-w-md">
    <div class="mb-6 text-center">
      <p class="text-sm font-semibold text-muted">500</p>
      <h1 class="mt-2 text-2xl font-bold tracking-tight text-base-content">Erreur serveur</h1>
      <p class="mt-1 text-sm text-muted">Une erreur inattendue est survenue. Veuillez réessayer.</p>
    </div>

    <BaseCard bodyClass="p-6 sm:p-8">
      <div class="space-y-4 text-center">
        <p class="text-sm text-muted">
          Redirection vers l'accueil dans {{ secondsLeft }} seconde{{ secondsLeft > 1 ? 's' : '' }}.
        </p>

        <BaseButton route="home" label="Retour à l'accueil" class="w-full" />
      </div>
    </BaseCard>
  </CenteredContent>
</template>
