<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
import { onBeforeUnmount, onMounted } from 'vue'

let redirectTimer: number | undefined

onMounted(() => {
  redirectTimer = window.setTimeout(() => {
    window.location.assign('/')
  }, 10_000)
})

onBeforeUnmount(() => {
  if (redirectTimer !== undefined) window.clearTimeout(redirectTimer)
})
</script>

<template>
  <Head title="Accès refusé" />

  <div class="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center text-center">
    <p class="text-sm font-semibold text-gray-500">403</p>
    <h1 class="mt-2 text-3xl font-bold tracking-tight text-gray-900">Accès refusé</h1>
    <p class="mt-2 text-sm text-gray-500">
      Vous n'avez pas les permissions nécessaires pour accéder à cette page.
    </p>
    <Link
      route="home"
      class="mt-6 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
    >
      Retour à l'accueil
    </Link>
  </div>
</template>
