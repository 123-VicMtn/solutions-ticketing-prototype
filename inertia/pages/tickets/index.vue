<script setup lang="ts">
import { Head, router } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
import { useAuth } from '~/composables/use_auth'
import ZebraTable from '~/components/common/zebraTable.vue'
import DropdownFilter from '~/components/common/dropdowns/DropdownFilter.vue'
import { EyeIcon } from '@heroicons/vue/24/outline'
import { ticketPriorityBadgeClass } from '~/utils/ticketPriority'
import type { Data } from '@generated/data'
import { ref } from 'vue'

const { isProvider } = useAuth()

const props = defineProps<{
  tickets: Data.Ticket[]
  filters: { status?: string; priority?: string }
}>()

const statuses = ['ouvert', 'assigné', 'en cours', 'résolu', 'fermé']
const priorities = ['basse', 'moyenne', 'élevée', 'urgente']

const selectedStatus = ref(props.filters.status ?? '')
const selectedPriority = ref(props.filters.priority ?? '')

const tableHeaders = [
  { key: 'reference', label: 'Réf' },
  { key: 'priority', label: 'Priorité' },
  { key: 'title', label: 'Titre' },
  { key: 'unit', label: 'Lot' },
  { key: 'user', label: 'Locataire' },
  { key: 'status', label: 'Statut' },
  { key: 'action', label: 'Actions', thClass: 'text-right', tdClass: 'text-right' },
]

function applyFilters() {
  const status = selectedStatus.value
  const priority = selectedPriority.value
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

    <div class="mt-6 flex gap-3">
      <DropdownFilter
        v-model="selectedStatus"
        title="Statut"
        :items="statuses"
        all-label="Tous"
        @change="applyFilters"
      />
      <DropdownFilter
        v-model="selectedPriority"
        title="Priorité"
        :items="priorities"
        all-label="Toutes"
        @change="applyFilters"
      />
    </div>

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
          {{ ticket.unit?.building?.name }} / {{ ticket.unit?.label }}
        </template>

        <template #cell:user="{ row: ticket }">
          {{ ticket.user?.fullName }}
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
