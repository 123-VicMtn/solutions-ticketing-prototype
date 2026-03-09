<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { Form, Link } from '@adonisjs/inertia/vue'
</script>

<template>
  <Head title="Nouvel immeuble" />

  <div class="mx-auto max-w-lg">
    <div class="mb-6">
      <Link route="admin.buildings.index" class="text-sm text-gray-500 hover:text-gray-900">
        &larr; Retour aux immeubles
      </Link>
    </div>

    <h1 class="text-2xl font-bold tracking-tight text-gray-900">Nouvel immeuble</h1>
    <p class="mt-1 text-sm text-gray-500">Ajoutez un nouvel immeuble au parc immobilier</p>

    <Form route="admin.buildings.store" #default="{ processing, errors }" class="mt-8 space-y-5">
      <div>
        <label for="name" class="mb-1.5 block text-sm font-medium text-gray-700">Nom</label>
        <input
          type="text"
          name="name"
          id="name"
          placeholder="Résidence des Alpes"
          class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
          :class="{ 'border-red-500': errors.name }"
        />
        <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
      </div>

      <div>
        <label for="address" class="mb-1.5 block text-sm font-medium text-gray-700">Adresse</label>
        <input
          type="text"
          name="address"
          id="address"
          placeholder="Rue du Lac 12"
          class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
          :class="{ 'border-red-500': errors.address }"
        />
        <p v-if="errors.address" class="mt-1 text-sm text-red-600">{{ errors.address }}</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="city" class="mb-1.5 block text-sm font-medium text-gray-700">Ville</label>
          <input
            type="text"
            name="city"
            id="city"
            placeholder="Lausanne"
            class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
            :class="{ 'border-red-500': errors.city }"
          />
          <p v-if="errors.city" class="mt-1 text-sm text-red-600">{{ errors.city }}</p>
        </div>
        <div>
          <label for="postalCode" class="mb-1.5 block text-sm font-medium text-gray-700">NPA</label>
          <input
            type="text"
            name="postalCode"
            id="postalCode"
            placeholder="1000"
            class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
            :class="{ 'border-red-500': errors.postalCode }"
          />
          <p v-if="errors.postalCode" class="mt-1 text-sm text-red-600">{{ errors.postalCode }}</p>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-4">
        <Link
          route="admin.buildings.index"
          class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </Link>
        <button
          type="submit"
          :disabled="processing"
          class="cursor-pointer rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Créer l'immeuble
        </button>
      </div>
    </Form>
  </div>
</template>
