<script setup lang="ts">
import { Head, usePage } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
import type { Data } from '@generated/data'

const page = usePage<Data.SharedProps>()
</script>

<template>
  <Head title="Accueil" />
  <div class="py-12">
    <div class="max-w-3xl">
      <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
        Gestion de tickets immobiliers
      </h1>
      <p class="mt-4 text-lg text-gray-600">
        Signalez et suivez vos demandes de maintenance en toute simplicité.
        Pannes, réparations, questions — tout est centralisé.
      </p>

      <div v-if="!page.props.user" class="mt-8 flex gap-4">
        <Link
          route="session.create"
          class="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          Se connecter
        </Link>
      </div>
    </div>

    <div class="mt-16 grid gap-6 sm:grid-cols-3">
      <div class="rounded-lg border border-gray-200 bg-white p-6">
        <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
          <svg class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <h3 class="font-semibold text-gray-900">Créer un ticket</h3>
        <p class="mt-1 text-sm text-gray-500">
          Décrivez votre problème et ajoutez des photos pour un traitement rapide.
        </p>
      </div>

      <div class="rounded-lg border border-gray-200 bg-white p-6">
        <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
          <svg class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.007-9.963-7.178Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </div>
        <h3 class="font-semibold text-gray-900">Suivre l'avancement</h3>
        <p class="mt-1 text-sm text-gray-500">
          Consultez le statut en temps réel et recevez des notifications par email.
        </p>
      </div>

      <div class="rounded-lg border border-gray-200 bg-white p-6">
        <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
          <svg class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <h3 class="font-semibold text-gray-900">Résolution rapide</h3>
        <p class="mt-1 text-sm text-gray-500">
          La gérance coordonne les entreprises externes pour résoudre vos demandes.
        </p>
      </div>
    </div>
  </div>
</template>
