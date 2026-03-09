<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3'

const props = defineProps<{
  tickets: Array<{
    id: number
    reference: string | null
    category: string
    priority: string
    status: string
    title: string
    createdAt: string
    unit: { id: number; label: string; building: { id: number; name: string } }
    user: { id: number; fullName: string | null; email: string }
  }>
  filters: { status?: string; priority?: string }
  isAdmin: boolean
}>()

const statuses = ['open', 'assigned', 'in_progress', 'resolved', 'closed']
const priorities = ['low', 'medium', 'high', 'urgent']

function applyFilters(form: HTMLFormElement) {
  const fd = new FormData(form)
  const status = String(fd.get('status') || '')
  const priority = String(fd.get('priority') || '')
  router.get(
    '/tickets',
    {
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
    },
    { preserveState: true }
  )
}
</script>

<template>
  <Head title="Tickets" />
  <div>
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-gray-900">Tickets</h1>
        <p class="mt-1 text-sm text-gray-500">Suivez les demandes d'intervention</p>
      </div>
      <Link
        href="/tickets/create"
        class="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        Nouveau ticket
      </Link>
    </div>

    <form class="mt-6 flex gap-3" @change="(e) => applyFilters(e.currentTarget as HTMLFormElement)">
      <select
        name="status"
        class="rounded-md border border-gray-300 px-3 py-2 text-sm"
      >
        <option value="">Tous les statuts</option>
        <option
          v-for="status in statuses"
          :key="status"
          :value="status"
          :selected="filters.status === status"
        >
          {{ status }}
        </option>
      </select>
      <select
        name="priority"
        class="rounded-md border border-gray-300 px-3 py-2 text-sm"
      >
        <option value="">Toutes les priorités</option>
        <option
          v-for="priority in priorities"
          :key="priority"
          :value="priority"
          :selected="filters.priority === priority"
        >
          {{ priority }}
        </option>
      </select>
    </form>

    <div class="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Réf</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Titre</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Lot</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Priorité</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Statut</th>
            <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="ticket in props.tickets" :key="ticket.id ">
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ ticket.reference ?? '-' }}</td>
            <td class="px-6 py-4 text-sm text-gray-900">
              <div class="font-medium">{{ ticket.title }}</div>
              <div class="text-xs text-gray-500">{{ ticket.category }}</div>
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
              {{ ticket.unit.building.name }} / {{ ticket.unit.label }}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ ticket.priority }}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ ticket.status }}</td>
            <td class="whitespace-nowrap px-6 py-4 text-right text-sm">
              <Link :href="`/tickets/${ticket.id}`" class="font-medium text-gray-700 hover:text-gray-900">
                Ouvrir
              </Link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
