<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
import type { Data } from '@generated/data'
import ZebraTable from '~/components/common/zebraTable.vue'
import { ArrowLeftIcon, PencilSquareIcon } from '@heroicons/vue/24/outline'
import ActionButton from '~/components/common/buttons/ActionButton.vue'

const props = defineProps<{
  building: Data.Building.Variants['forSummary']
  units: Data.Unit[]
}>()

const tableHeaders = [
  { key: 'label', label: 'Lot' },
  { key: 'type', label: 'Type' },
  { key: 'floor', label: 'Étage' },
  { key: 'actions', label: 'Actions', thClass: 'text-right', tdClass: 'text-right' },
]
</script>

<template>
  <Head :title="`Lots — ${props.building.name}`" />

    <div class="mb-6">
      <Link route="admin.buildings.index" class="text-sm text-muted">
        <span class="inline-flex items-center gap-2">
          <ArrowLeftIcon class="size-4" />
          Retour aux immeubles
        </span>
      </Link>
    </div>

    <div class="mb-6">
      <h1 class="text-2xl font-bold tracking-tight text-base-content">Lots</h1>
      <p class="mt-1 text-sm text-muted">{{ props.building.name }}</p>
    </div>

    <div class="mt-6">
      <ZebraTable :headers="tableHeaders" :rows="props.units" :rowKey="(u) => u.id">
        <template #cell:label="{ row: unit }">
          <span class="font-medium text-base-content">{{ unit.label }}</span>
        </template>

        <template #cell:type="{ row: unit }">
          <span>{{ unit.type }}</span>
        </template>

        <template #cell:floor="{ row: unit }">
          <span>{{ unit.floor }}</span>
        </template>

        <template #cell:actions="{ row: unit }">
          <div class="flex justify-end gap-1">
            <ActionButton
              route="admin.units.edit"
              :params="{ id: unit.id }"
              :icon="PencilSquareIcon"
              ariaLabel="Editer"
              title="Editer"
            />
          </div>
        </template>
      </ZebraTable>
    </div>
</template>

