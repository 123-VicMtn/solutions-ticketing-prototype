<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { Link, Form } from '@adonisjs/inertia/vue'

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

function confirmDelete(e: Event, message: string) {
  if (!globalThis.confirm(message)) return
  ;(e.target as HTMLFormElement).closest('form')!.submit()
}
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

    <div v-else class="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nom</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Adresse</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Ville</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">NPA</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Lots</th>
            <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="building in buildings" :key="building.id">
            <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{{ building.name }}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ building.address }}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ building.city }}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ building.postalCode }}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ building.unitsCount }}</td>
            <td class="whitespace-nowrap px-6 py-4 text-right text-sm">
              <Link
                route="admin.buildings.edit"
                :params="{ id: building.id }"
                class="font-medium text-gray-600 hover:text-gray-900"
              >
                Modifier
              </Link>
              <Form
                route="admin.buildings.destroy"
                :params="{ id: building.id }"
                method="delete"
                class="ml-4 inline"
                @submit.prevent="(e: Event) => confirmDelete(e, 'Supprimer cet immeuble et tous ses lots ?')"
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
