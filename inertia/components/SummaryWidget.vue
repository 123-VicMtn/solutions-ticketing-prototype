<script setup lang="ts">
import { ArrowRightIcon } from '@heroicons/vue/24/outline'

const { countsByStatus, recentTickets } = defineProps<{
  countsByStatus: { status: string; count: number }[]
  recentTickets: Array<{
    id: number
    reference: string | null
    title: string
    status: string
    createdAt: string
    unit: { label: string }
  }>
}>()
</script>
<template>
  {{ console.log(countsByStatus) }}
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 mb-10">
    <div
      v-for="stat in countsByStatus"
      :key="stat.status"
      class="rounded-lg shadow-sm bg-white p-6 flex flex-col items-center justify-center"
    >
      <div class="text-4xl font-extrabold text-gray-900 mb-1">
        {{ stat.count }}
      </div>
      <div :class="['px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700']">
        {{ stat.status }}
      </div>
    </div>
  </div>

  <div class="bg-white shadow rounded-lg overflow-x-auto mb-8">
    <div class="px-6 py-4 border-b flex items-center justify-between">
      <h2 class="text-lg font-semibold text-gray-900">Derniers tickets</h2>
      <a
        href="/tickets"
        class="text-sm bg-gray-200 rounded-full px-4 py-2 text-gray-700 hover:text-gray-900 font-semibold flex items-center gap-2"
        >Voir tous les tickets
        <ArrowRightIcon class="w-4 h-4" />
      </a>
    </div>
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Réf
          </th>
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Titre
          </th>
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Statut
          </th>
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Créé le
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="ticket in recentTickets" :key="ticket.id">
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {{ ticket.reference || ticket.id }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {{ ticket.title }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span :class="['px-3 py-1 rounded-full text-sm font-semibold text-gray-700']">
              {{ ticket.status }}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '-' }}
          </td>
        </tr>
        <tr v-if="!recentTickets || recentTickets.length === 0">
          <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
            Aucun ticket récent trouvé.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
