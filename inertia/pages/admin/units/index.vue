<script setup lang="ts">
import { Head, router } from '@inertiajs/vue3'
import { Link, Form } from '@adonisjs/inertia/vue'

const props = defineProps<{
  units: Array<{
    id: number
    label: string
    floor: number
    type: string
    building: { id: number; name: string }
  }>
  buildings: Array<{ id: number; name: string }>
  filters: { buildingId: number | null }
}>()

const unitTypeLabels: Record<string, string> = {
  apartment: 'Appartement',
  commercial: 'Commercial',
  parking: 'Parking',
  storage: 'Cave',
}

function confirmDelete(e: Event, message: string) {
  if (!globalThis.confirm(message)) return
  ;(e.target as HTMLFormElement).closest('form')!.submit()
}

function filterByBuilding(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  router.get('/admin/units', value ? { building_id: value } : {}, { preserveState: true })
}
</script>

<template>
  <Head title="Lots" />

  <div>
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-gray-900">Lots</h1>
        <p class="mt-1 text-sm text-gray-500">Gérez les lots (appartements, parkings, caves…)</p>
      </div>
      <Link
        route="admin.units.create"
        class="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        Ajouter un lot
      </Link>
    </div>

    <div class="mt-6">
      <select
        @change="filterByBuilding"
        class="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
      >
        <option value="">Tous les immeubles</option>
        <option
          v-for="b in buildings"
          :key="b.id"
          :value="b.id"
          :selected="filters.buildingId === b.id"
        >
          {{ b.name }}
        </option>
      </select>
    </div>

    <div v-if="units.length === 0" class="mt-8 rounded-lg border border-dashed border-gray-300 p-12 text-center">
      <p class="text-sm text-gray-500">Aucun lot pour le moment</p>
      <Link
        route="admin.units.create"
        class="mt-4 inline-block text-sm font-medium text-gray-900 hover:underline"
      >
        Créer le premier lot
      </Link>
    </div>

    <div v-else class="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Label</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Immeuble</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Étage</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
            <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="unit in units" :key="unit.id">
            <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{{ unit.label }}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ unit.building.name }}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ unit.floor }}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
              <span class="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                {{ unitTypeLabels[unit.type] || unit.type }}
              </span>
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-right text-sm">
              <Link
                route="admin.units.edit"
                :params="{ id: unit.id }"
                class="font-medium text-gray-600 hover:text-gray-900"
              >
                Modifier
              </Link>
              <Form
                route="admin.units.destroy"
                :params="{ id: unit.id }"
                method="delete"
                class="ml-4 inline"
                @submit.prevent="(e: Event) => confirmDelete(e, 'Supprimer ce lot ?')"
              >
                <button type="submit" class="cursor-pointer font-medium text-red-600 hover:text-red-800">
                  Supprimer
                </button>
              </Form>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
