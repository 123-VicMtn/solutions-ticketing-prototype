<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { computed } from 'vue';
import { Link } from '@adonisjs/inertia/vue';

const props = defineProps<{
  profileUser: {
    id: number
    role: 'admin' | 'tenant' | 'owner'
    firstName: string
    lastName: string
    email: string
    phone: string
    notificationPreference: 'email' | 'sms'
    createdAt: string
    updatedAt: string
  }
  userUnits: Array<{
    id: number
    relation: string
    unit: { id: number; label: string; building: { id: number; name: string } }
  }>
  tickets: Array<{
    id: number
    reference: string | null
    category: string
    priority: string
    status: string
    title: string
    description: string
    createdAt: string
  }>
}>()

const userRole = computed(() => {
  return props.profileUser.role === 'admin' ? 'Propriétaire' : 'Locataire'
})
</script>

<template>
  <Head :title="profileUser.firstName + ' ' + profileUser.lastName" />
  <div class="space-y-8">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-gray-900">
        {{ profileUser.firstName + ' ' + profileUser.lastName }}
      </h1>
    </div>
    <div>
      <h2 class="text-lg font-medium tracking-tight text-gray-900">Informations</h2>
      <p class="text-sm text-gray-500">{{ userRole }}</p>
      <p class="text-sm text-gray-500">{{ profileUser.email }}</p>
      <p class="text-sm text-gray-500">{{ profileUser.phone }}</p>
      <p class="text-sm text-gray-500">{{ profileUser.notificationPreference }}</p>
    </div>
    <div class="text-lg font-medium tracking-tight text-gray-900">Tickets</div>
    </div>
    <div class="mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Réf</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Titre</th>
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
</template>
