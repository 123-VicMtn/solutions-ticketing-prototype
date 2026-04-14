<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { Form, Link } from '@adonisjs/inertia/vue'
import ZebraTable from '~/components/common/zebraTable.vue'

import { ref } from 'vue'

const props = defineProps<{
  buildings: Array<{
    id: number
    name: string
    address: string
    city: string
    postalCode: string
    unitsCount: number
  }>
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
      <Link
        route="admin.buildings.create"
        class="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        Ajouter un immeuble
      </Link>
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
              class="btn btn-primary btn-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </Link>

            <button type="button" class="btn btn-error btn-sm" @click="openDeleteModal(building)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.108 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
            </button>
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
