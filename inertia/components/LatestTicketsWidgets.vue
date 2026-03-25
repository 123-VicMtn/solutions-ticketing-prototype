<script setup lang="ts">
import { ArrowRightIcon, EyeIcon } from '@heroicons/vue/24/outline'
import { router } from '@inertiajs/vue3'

const { recentTickets } = defineProps<{
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
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Actions
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr
          v-for="ticket in recentTickets"
          :key="ticket.id"
          @click="router.visit(`/tickets/${ticket.id}`)"
          class="hover:bg-gray-50 cursor-pointer transition"
        >
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
          <td class="px-6 py-4 whitespace-nowrap text-right">
            <EyeIcon class="w-4 h-4 text-gray-500" />
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
