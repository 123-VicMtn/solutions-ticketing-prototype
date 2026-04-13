<script setup lang="ts">
import { Head, router } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
import ZebraTable from '~/components/common/zebraTable.vue'

defineProps<{
  buildings: Array<{
    id: number
    name: string
    address: string
    city: string
    postalCode: string
    unitsCount: number
  }>
}>()

function deleteBuilding(id: number) {
  if (!globalThis.confirm('Supprimer cet immeuble et tous ses lots ?')) return
  router.delete(`/admin/buildings/${id}`)
}

const tableHeaders = [
  { key: 'name', label: 'Nom' },
  { key: 'address', label: 'Adresse' },
  { key: 'city', label: 'Ville' },
  { key: 'postalCode', label: 'NPA' },
  { key: 'unitsCount', label: 'Lots' },
  { key: 'actions', label: 'Actions', thClass: 'text-right', tdClass: 'text-right' },
]
</script>

<template>
  <Head title="Immeubles" />

  <div>
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-gray-900">Immeubles</h1>
        <p class="mt-1 text-sm text-gray-500">Gérez les immeubles et leurs lots</p>
      </div>
      <Link
        route="admin.buildings.create"
        class="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        Ajouter un immeuble
      </Link>
    </div>

    <div v-if="buildings.length === 0" class="mt-8 rounded-lg border border-dashed border-gray-300 p-12 text-center">
      <p class="text-sm text-gray-500">Aucun immeuble pour le moment</p>
      <Link
        route="admin.buildings.create"
        class="mt-4 inline-block text-sm font-medium text-gray-900 hover:underline"
      >
        Créer le premier immeuble
      </Link>
    </div>

    <div v-else class="mt-6">
      <ZebraTable :headers="tableHeaders" :rows="buildings" :rowKey="(b) => b.id">
        <template #cell:name="{ row: building }">
          <span class="text-sm font-medium text-gray-900">{{ building.name }}</span>
        </template>

        <template #cell:address="{ row: building }">
          <span class="text-sm text-gray-500">{{ building.address }}</span>
        </template>

        <template #cell:city="{ row: building }">
          <span class="text-sm text-gray-500">{{ building.city }}</span>
        </template>

        <template #cell:postalCode="{ row: building }">
          <span class="text-sm text-gray-500">{{ building.postalCode }}</span>
        </template>

        <template #cell:unitsCount="{ row: building }">
          <span class="text-sm text-gray-500">{{ building.unitsCount }}</span>
        </template>

        <template #cell:actions="{ row: building }">
          <Link
            route="admin.buildings.edit"
            :params="{ id: building.id }"
            class="font-medium text-gray-600 hover:text-gray-900"
          >
            Modifier
          </Link>
          <button
            type="button"
            class="ml-4 cursor-pointer font-medium text-red-600 hover:text-red-800"
            @click="deleteBuilding(building.id)"
          >
            Supprimer
          </button>
        </template>
      </ZebraTable>
    </div>
  </div>
</template>
