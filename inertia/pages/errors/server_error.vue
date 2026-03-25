<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'

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

  <div class="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center text-center">
    <p class="text-sm font-semibold text-gray-500">500</p>
    <h1 class="mt-2 text-3xl font-bold tracking-tight text-gray-900">Erreur serveur</h1>
    <p class="mt-2 text-sm text-gray-500">Une erreur inattendue est survenue. Veuillez réessayer.</p>
    <p class="mt-2 text-sm text-gray-500">
      Redirection vers l'accueil dans {{ secondsLeft }} seconde{{ secondsLeft > 1 ? 's' : '' }}.
    </p>
    <Link
      route="home"
      class="mt-6 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
    >
      Retour à l'accueil
    </Link>
  </div>
</template>
