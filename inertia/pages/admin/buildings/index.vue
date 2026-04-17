<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { Form, Link } from '@adonisjs/inertia/vue'
import ZebraTable from '~/components/common/zebraTable.vue'
import BaseButton from '~/components/common/buttons/BaseButton.vue'
import { PencilSquareIcon, PlusCircleIcon } from '@heroicons/vue/24/outline'
import type { Data } from '@generated/data'

import { ref } from 'vue'

const props = defineProps<{
  buildings: Data.Building.Variants['forListing'][]
}>()

const deleteDialogRef = ref<HTMLDialogElement | null>(null)
const deletingBuilding = ref<{ id: number; name: string; unitsCount: number } | null>(null)

function openDeleteModal(building: { id: number; name: string; unitsCount: number }) {
  deletingBuilding.value = building
  deleteDialogRef.value?.showModal()
}

function closeDeleteModal() {
  deleteDialogRef.value?.close()
  deletingBuilding.value = null
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
      class="mt-8 rounded-lg border border-dashed border-gray-300 p-12 text-center"
    >
      <p class="text-sm text-gray-500">Aucun immeuble pour le moment</p>
      <Link
        route="admin.buildings.create"
        class="mt-4 inline-block text-sm font-medium text-gray-900 hover:underline"
      >
        Créer le premier immeuble
      </Link>
    </div>

    <div v-else class="mt-6">
      <ZebraTable :headers="tableHeaders" :rows="props.buildings" :rowKey="(b) => b.id">
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
          <div class="flex justify-end gap-1">
            <Link
              route="admin.buildings.edit"
              :params="{ id: building.id }"
              class="btn btn-ghost btn-sm"
              aria-label="Editer"
              title="Edit"
            >
              <PencilSquareIcon class="size-5" />
            </Link>
    
          </div>
        </template>
      </ZebraTable>
    </div>

    <dialog ref="deleteDialogRef" class="modal">
      <div class="modal-box">
        <h3 class="text-lg font-bold">Supprimer l’immeuble</h3>
        <p class="py-4 text-sm text-base-content/70" v-if="deletingBuilding">
          Confirmer la suppression de <span class="font-medium">{{ deletingBuilding.name }}</span>
          <span v-if="deletingBuilding.unitsCount"> ({{ deletingBuilding.unitsCount }} lots)</span>
          ?
        </p>
        <p class="text-sm text-base-content/70" v-if="deletingBuilding">
          Cette action supprimera aussi les lots associés.
        </p>

        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="closeDeleteModal">Annuler</button>

          <Form
            v-if="deletingBuilding"
            route="admin.buildings.destroy"
            :params="{ id: deletingBuilding.id }"
            method="delete"
            class="contents"
          >
            <button type="submit" class="btn btn-error">Supprimer</button>
          </Form>
        </div>
      </div>

      <form method="dialog" class="modal-backdrop">
        <button @click="closeDeleteModal">close</button>
      </form>
    </dialog>
  </div>
</template>
