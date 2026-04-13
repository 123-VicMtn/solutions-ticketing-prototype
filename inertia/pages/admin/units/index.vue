<script setup lang="ts">
import { Head, router } from '@inertiajs/vue3'
import { Link, Form } from '@adonisjs/inertia/vue'
import ZebraTable from '~/components/common/zebraTable.vue'

import { ref } from 'vue'

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

const deleteDialogRef = ref<HTMLDialogElement | null>(null)
const deletingUnit = ref<{ id: number; label: string; building: { name: string } } | null>(null)

function openDeleteModal(unit: { id: number; label: string; building: { name: string } }) {
  deletingUnit.value = unit
  deleteDialogRef.value?.showModal()
}

function closeDeleteModal() {
  deleteDialogRef.value?.close()
  deletingUnit.value = null
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
        <h1 class="text-2xl font-bold tracking-tight">Lots</h1>
        <p class="mt-1 text-sm text-base-content/70">
          Gérez les lots (appartements, parkings, caves…)
        </p>
      </div>
      <Link route="admin.units.create" class="btn btn-primary"> Ajouter un lot </Link>
    </div>

    <div class="mt-6">
      <select @change="filterByBuilding" class="select select-bordered select-sm">
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

    <div
      v-if="units.length === 0"
      class="mt-8 rounded-lg border border-dashed border-base-300 p-12 text-center"
    >
      <p class="text-sm text-base-content/70">Aucun lot pour le moment</p>
      <Link
        route="admin.units.create"
        class="mt-4 inline-block text-sm font-medium link link-hover"
      >
        Créer le premier lot
      </Link>
    </div>

    <div v-else class="mt-4">
      <ZebraTable :headers="tableHeaders" :rows="props.units" :rowKey="(u) => u.id">
        <template #cell:label="{ row: unit }">
          <span class="text-sm font-medium">{{ unit.label }}</span>
        </template>

        <template #cell:building="{ row: unit }">
          <span class="text-sm text-base-content/70">{{ unit.building.name }}</span>
        </template>

        <template #cell:floor="{ row: unit }">
          <span class="text-sm text-base-content/70">{{ unit.floor }}</span>
        </template>

        <template #cell:type="{ row: unit }">
          <span class="badge badge-ghost">
            {{ unitTypeLabels[unit.type] || unit.type }}
          </span>
        </template>

        <template #cell:tenant="{ row: unit }">
          <template v-if="unit.userUnits.length > 0 && unit.userUnits[0].user">
            <Link
              route="users.show"
              :params="{ id: unit.userUnits[0].user.id }"
              class="font-medium link link-hover"
            >
              {{ unit.userUnits[0].user.fullName }}
            </Link>
          </template>
          <span v-else class="text-base-content/50">-</span>
        </template>

        <template #cell:actions="{ row: unit }">
          <div class="flex justify-end gap-1">
            <Link route="admin.units.edit" :params="{ id: unit.id }" class="btn btn-primary btn-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                />
              </svg>
            </Link>
            <button type="button" class="btn btn-error btn-sm" @click="openDeleteModal(unit)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-4"
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
        <h3 class="text-lg font-bold">Supprimer le lot</h3>
        <p class="py-4 text-sm text-base-content/70" v-if="deletingUnit">
          Confirmer la suppression de <span class="font-medium">{{ deletingUnit.label }}</span> ({{
            deletingUnit.building.name
          }}) ?
        </p>

        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="closeDeleteModal">Annuler</button>

          <Form
            v-if="deletingUnit"
            route="admin.units.destroy"
            :params="{ id: deletingUnit.id }"
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
