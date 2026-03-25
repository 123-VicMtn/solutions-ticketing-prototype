<script setup lang="ts">
import { Head, usePage } from '@inertiajs/vue3'
import SummaryWidget from '~/components/SummaryWidget.vue'
import LatestTicketsWidgets from '~/components/LatestTicketsWidgets.vue'

const page = usePage()
const countsByStatus = page.props.countsByStatus as { status: string; count: number }[]
const recentTickets = page.props.recentTickets as Array<{
  id: number
  reference: string | null
  title: string
  status: string
  createdAt: string
  unit: { label: string }
}>
</script>

<template>
  <Head title="Tableau de bord" />
  <div class="px-4 py-12 max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-4">Tableau de bord</h1>
    <SummaryWidget :counts-by-status="countsByStatus" />
    <LatestTicketsWidgets :recent-tickets="recentTickets" />
  </div>
</template>
