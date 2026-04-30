<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import SummaryWidget from '~/components/widgets/SummaryWidget.vue'
import LatestTicketsWidgets from '~/components/widgets/LatestTicketsWidgets.vue'
import { isTicketStatus, type TicketStatus } from '~/utils/ticket_status'
import type { Data } from '@generated/data'

const props = defineProps<{
  countsByStatus: Array<{ status: string; count: number }>
  recentTickets: Data.Ticket[]
}>()

const visibleRecentTickets = props.recentTickets.filter(
  (t): t is Data.Ticket & { status: TicketStatus } => isTicketStatus(t.status)
)
</script>

<template>
  <Head title="Tableau de bord" />
  <div class="px-4 max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-4">Tableau de bord</h1>
    <SummaryWidget :counts-by-status="countsByStatus" />
    <LatestTicketsWidgets :recent-tickets="visibleRecentTickets" />
  </div>
</template>
