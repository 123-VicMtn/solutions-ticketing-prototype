<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
</script>

<template>
  <Head title="Erreur serveur" />

  <div class="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center text-center">
    <p class="text-sm font-semibold text-gray-500">500</p>
    <h1 class="mt-2 text-3xl font-bold tracking-tight text-gray-900">Erreur serveur</h1>
    <p class="mt-2 text-sm text-gray-500">Une erreur inattendue est survenue. Veuillez réessayer.</p>
    <Link
      route="home"
      class="mt-6 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
    >
      Retour à l'accueil
    </Link>
  </div>
</template>
