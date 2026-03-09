<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { Form, Link } from '@adonisjs/inertia/vue'

defineProps<{
  buildings: Array<{ id: number; name: string }>
}>()
</script>

<template>
  <Head title="Nouveau lot" />

  <div class="mx-auto max-w-lg">
    <div class="mb-6">
      <Link route="admin.units.index" class="text-sm text-gray-500 hover:text-gray-900">
        &larr; Retour aux lots
      </Link>
    </div>

    <h1 class="text-2xl font-bold tracking-tight text-gray-900">Nouveau lot</h1>
    <p class="mt-1 text-sm text-gray-500">Ajoutez un lot à un immeuble existant</p>

    <Form route="admin.units.store" #default="{ processing, errors }" class="mt-8 space-y-5">
      <div>
        <label for="buildingId" class="mb-1.5 block text-sm font-medium text-gray-700">Immeuble</label>
        <select
          name="buildingId"
          id="buildingId"
          class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
          :class="{ 'border-red-500': errors.buildingId }"
        >
          <option value="">Sélectionner un immeuble</option>
          <option v-for="b in buildings" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
        <p v-if="errors.buildingId" class="mt-1 text-sm text-red-600">{{ errors.buildingId }}</p>
      </div>

      <div>
        <label for="label" class="mb-1.5 block text-sm font-medium text-gray-700">Label</label>
        <input
          type="text"
          name="label"
          id="label"
          placeholder="Apt 3B"
          class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
          :class="{ 'border-red-500': errors.label }"
        />
        <p v-if="errors.label" class="mt-1 text-sm text-red-600">{{ errors.label }}</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="floor" class="mb-1.5 block text-sm font-medium text-gray-700">Étage</label>
          <input
            type="number"
            name="floor"
            id="floor"
            value="0"
            class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
            :class="{ 'border-red-500': errors.floor }"
          />
          <p v-if="errors.floor" class="mt-1 text-sm text-red-600">{{ errors.floor }}</p>
        </div>
        <div>
          <label for="type" class="mb-1.5 block text-sm font-medium text-gray-700">Type</label>
          <select
            name="type"
            id="type"
            class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
            :class="{ 'border-red-500': errors.type }"
          >
            <option value="apartment">Appartement</option>
            <option value="commercial">Commercial</option>
            <option value="parking">Parking</option>
            <option value="storage">Cave</option>
          </select>
          <p v-if="errors.type" class="mt-1 text-sm text-red-600">{{ errors.type }}</p>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-4">
        <Link
          route="admin.units.index"
          class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </Link>
        <button
          type="submit"
          :disabled="processing"
          class="cursor-pointer rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Créer le lot
        </button>
      </div>
    </Form>
  </div>
</template>
