<script setup lang="ts">
import { Head, router } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
import ZebraTable from '~/components/common/zebraTable.vue'

const props = defineProps<{
  units: Array<{
    id: number
    label: string
    floor: number
    type: string
    building: { id: number; name: string }
    userUnits: Array<{
      id: number
      user: { id: number; fullName: string; email: string; phone: string; role: string }
    }>
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

const tableHeaders = [
  { key: 'label', label: 'Label' },
  { key: 'building', label: 'Immeuble' },
  { key: 'floor', label: 'Étage' },
  { key: 'type', label: 'Type' },
  { key: 'tenant', label: 'Locataire' },
  { key: 'actions', label: 'Actions', thClass: 'text-right', tdClass: 'text-right' },
]

function deleteUnit(id: number) {
  if (!globalThis.confirm('Supprimer ce lot ?')) return
  router.delete(`/admin/units/${id}`)
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

    <div v-else class="mt-4">
      <ZebraTable :headers="tableHeaders" :rows="props.units" :rowKey="(u) => u.id">
        <template #cell:label="{ row: unit }">
          <span class="text-sm font-medium text-gray-900">{{ unit.label }}</span>
        </template>

        <template #cell:building="{ row: unit }">
          <span class="text-sm text-gray-500">{{ unit.building.name }}</span>
        </template>

        <template #cell:floor="{ row: unit }">
          <span class="text-sm text-gray-500">{{ unit.floor }}</span>
        </template>

        <template #cell:type="{ row: unit }">
          <span class="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
            {{ unitTypeLabels[unit.type] || unit.type }}
          </span>
        </template>

        <template #cell:tenant="{ row: unit }">
          <template v-if="unit.userUnits.length > 0 && unit.userUnits[0].user">
            <Link
              route="users.show"
              :params="{ id: unit.userUnits[0].user.id }"
              class="font-medium text-gray-600 hover:text-gray-900"
            >
              {{ unit.userUnits[0].user.fullName }}
            </Link>
          </template>
          <span v-else class="text-gray-400">-</span>
        </template>

        <template #cell:actions>
          <!-- Intentionally empty (same as current UI) -->
        </template>
      </ZebraTable>
    </div>
  </div>
</template>
