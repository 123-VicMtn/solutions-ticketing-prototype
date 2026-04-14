<script setup lang="ts">
import { Head, usePage } from '@inertiajs/vue3'
import SummaryWidget from '~/components/widgets/SummaryWidget.vue'
import LatestTicketsWidgets from '~/components/widgets/LatestTicketsWidgets.vue'
import { isTicketStatus, type TicketStatus } from '~/utils/ticketStatus'

const page = usePage()
const countsByStatus = page.props.countsByStatus as { status: string; count: number }[]
const recentTicketsRaw = page.props.recentTickets as Array<{
  id: number
  reference: string | null
  title: string
  status: string
  createdAt: string
  unit: { label: string }
}>

const recentTickets: Array<{
  id: number
  reference: string | null
  title: string
  status: TicketStatus
  createdAt: string
  unit: { label: string }
}> = recentTicketsRaw
  .filter(
    (t): t is Omit<(typeof recentTicketsRaw)[number], 'status'> & { status: TicketStatus } => isTicketStatus(t.status)
  )
  .map((t) => ({ ...t, status: t.status }))
</script>

<template>
  <Head title="Tableau de bord" />
  <div class="px-4 max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-4">Tableau de bord</h1>
    <SummaryWidget :counts-by-status="countsByStatus" />
    <LatestTicketsWidgets :recent-tickets="recentTickets" />
  </div>
</template>
