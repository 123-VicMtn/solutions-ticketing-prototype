<script setup lang="ts">
import { Head, router } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
import { useAuth } from '~/composables/use_auth'
import ZebraTable from '~/components/common/zebraTable.vue'
import { EyeIcon } from '@heroicons/vue/24/outline'
import { ticketPriorityBadgeClass } from '~/utils/ticketPriority'

const { isProvider } = useAuth()

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
}>()

const statuses = ['ouvert', 'assigné', 'en cours', 'résolu', 'fermé']
const priorities = ['basse', 'moyenne', 'élevée', 'urgente']

const tableHeaders = [
  { key: 'reference', label: 'Réf' },
  { key: 'priority', label: 'Priorité' },
  { key: 'title', label: 'Titre' },
  { key: 'unit', label: 'Lot' },
  { key: 'user', label: 'Locataire' },
  { key: 'status', label: 'Statut' },
  { key: 'action', label: 'Actions', thClass: 'text-right', tdClass: 'text-right' },
]

function applyFilters(form: HTMLFormElement) {
  const formData = new FormData(form)
  const status = String(formData.get('status') || '')
  const priority = String(formData.get('priority') || '')
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
        v-if="!isProvider"
        route="tickets.create"
        class="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        Nouveau ticket
      </Link>
    </div>

    <form class="mt-6 flex gap-3" @change="(e) => applyFilters(e.currentTarget as HTMLFormElement)">
      <select name="status" class="rounded-md border border-gray-300 p-2 text-sm">
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
      <select name="priority" class="rounded-md border border-gray-300 p-2 text-sm">
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

    <div class="mt-6">
      <ZebraTable :headers="tableHeaders" :rows="props.tickets" :rowKey="(t) => t.id">
        <template #cell:reference="{ row: ticket }">
          {{ ticket.reference ?? '-' }}
        </template>

        <template #cell:title="{ row: ticket }">
          <div class="font-medium">{{ ticket.title }}</div>
          <div class="text-xs text-gray-500">{{ ticket.category }}</div>
        </template>

        <template #cell:unit="{ row: ticket }">
          {{ ticket.unit.building.name }} / {{ ticket.unit.label }}
        </template>

        <template #cell:user="{ row: ticket }">
          {{ ticket.user.fullName }}
        </template>

        <template #cell:priority="{ row: ticket }">
          <span class="text-sm">
            <span :class="ticketPriorityBadgeClass(ticket.priority)">{{ ticket.priority }}</span>
          </span>
        </template>

        <template #cell:status="{ row: ticket }">
          <span class="text-sm">
            <span class="badge badge-primary h-auto">{{ ticket.status }}</span>
          </span>
        </template>

        <template #cell:action="{ row: ticket }">
          <Link
            route="tickets.show"
            :params="{ id: ticket.id }"
            class="btn btn-ghost btn-sm"
          >
            <EyeIcon class="size-5" />
          </Link>
        </template>
      </ZebraTable>
    </div>
  </div>
</template>
