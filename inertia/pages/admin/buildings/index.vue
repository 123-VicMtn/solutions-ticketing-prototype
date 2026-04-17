<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import ZebraTable from '~/components/common/zebraTable.vue'
import BaseButton from '~/components/common/buttons/BaseButton.vue'
import ActionButton from '~/components/common/buttons/ActionButton.vue'
import { PencilSquareIcon, PlusCircleIcon, Square3Stack3DIcon } from '@heroicons/vue/24/outline'
import type { Data } from '@generated/data'

const props = defineProps<{
  buildings: Data.Building.Variants['forListing'][]
}>()

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
        <h1 class="text-2xl font-bold tracking-tight text-base-content">Immeubles</h1>
        <p class="mt-1 text-sm text-muted">Gérez les immeubles et leurs lots</p>
      </div>
      <BaseButton
        route="admin.buildings.create"
        label="Ajouter un immeuble"
        :icon="PlusCircleIcon"
        type="button"
        class="ml-auto"
      />
    </div>

    <div
      v-if="buildings.length === 0"
      class="mt-8 rounded-lg border border-dashed border-base-300 p-12 text-center"
    >
        <p class="text-sm text-muted">Aucun immeuble pour le moment</p>
        <BaseButton
          route="admin.buildings.create"
          label="Créer le premier immeuble"
          :icon="PlusCircleIcon"
          type="button"
          class="mt-4"
        />
    </div>

    <div v-else class="mt-6">
      <ZebraTable :headers="tableHeaders" :rows="props.buildings" :rowKey="(b) => b.id">
        <template #cell:name="{ row: building }">
          <span class="font-medium text-base-content">{{ building.name }}</span>
        </template>

        <template #cell:address="{ row: building }">
          <span>{{ building.address }}</span>
        </template>

        <template #cell:city="{ row: building }">
          <span>{{ building.city }}</span>
        </template>

        <template #cell:postalCode="{ row: building }">
          <span>{{ building.postalCode }}</span>
        </template>

        <template #cell:unitsCount="{ row: building }">
          <span>{{ building.unitsCount }}</span>
        </template>

        <template #cell:actions="{ row: building }">
          <div class="flex justify-end gap-1">
            <ActionButton
              v-if="building.unitsCount > 0"
              route="admin.buildings.units.index"
              :params="{ id: building.id }"
              :icon="Square3Stack3DIcon"
              ariaLabel="Voir les lots"
              title="Lots"
            />
            <ActionButton
              route="admin.buildings.edit"
              :params="{ id: building.id }"
              :icon="PencilSquareIcon"
              ariaLabel="Editer"
              title="Edit"
            />
    
          </div>
        </template>
      </ZebraTable>
    </div>
  </div>
</template>
