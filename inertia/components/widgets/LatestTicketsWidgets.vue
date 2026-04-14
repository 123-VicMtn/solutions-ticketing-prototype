<script setup lang="ts">
import { ArrowRightIcon } from '@heroicons/vue/24/outline'
import { Link } from '@adonisjs/inertia/vue'
import ZebraTable from '~/components/common/zebraTable.vue'
import { ticketStatusBadgeClass, type TicketStatus } from '~/utils/ticketStatus'

const { recentTickets } = defineProps<{
  recentTickets: Array<{
    id: number
    reference: string | null
    title: string
    status: TicketStatus
    createdAt: string
    unit: { label: string }
  }>
}>()

const tableHeaders = [
  { key: 'reference', label: 'Réf' },
  { key: 'title', label: 'Titre' },
  { key: 'status', label: 'Statut' },
  { key: 'createdAt', label: 'Créé le' },
  { key: 'actions', label: 'Actions', thClass: 'text-right', tdClass: 'text-right' },
]
</script>
<template>
  <div class="bg-white overflow-x-auto mb-8">
    <div class="px-6 py-4 flex items-center justify-between">
      <h2 class="text-lg font-semibold text-gray-900">Derniers tickets</h2>
      <Link href="/tickets" class="btn btn-sm gap-2">
        Voir tous les tickets
        <ArrowRightIcon class="w-4 h-4" />
      </Link>
    </div>
    <div class="px-2 pb-2">
      <div
        v-if="!recentTickets?.length"
        class="mt-4 rounded-lg border border-dashed border-base-300 p-8 text-center"
      >
        <p class="text-sm text-base-content/70">Aucun ticket récent trouvé.</p>
      </div>

      <ZebraTable v-else :headers="tableHeaders" :rows="recentTickets" :rowKey="(t) => t.id">
        <template #cell:reference="{ row: ticket }">
          <span class="text-sm font-medium text-gray-900">
            {{ ticket.reference || ticket.id }}
          </span>
        </template>

        <template #cell:title="{ row: ticket }">
          <span class="text-sm text-gray-900">
            {{ ticket.title }}
          </span>
        </template>

        <template #cell:status="{ row: ticket }">
          <span class="text-sm">
            <span :class="ticketStatusBadgeClass(ticket.status)">{{ ticket.status }}</span>
          </span>
        </template>

        <template #cell:createdAt="{ row: ticket }">
          <span class="text-sm text-gray-500">
            {{ ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '-' }}
          </span>
        </template>

        <template #cell:actions="{ row: ticket }">
          <div class="flex justify-end gap-1">
            <Link :href="`/tickets/${ticket.id}`" class="btn btn-primary btn-sm">
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
          </div>
        </template>
      </ZebraTable>
    </div>
  </div>
</template>
