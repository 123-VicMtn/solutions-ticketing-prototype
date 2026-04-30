<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { computed } from 'vue'
import { Link } from '@adonisjs/inertia/vue'
import { ticketPriorityBadgeClass } from '~/utils/ticket_priority'
import type { Data } from '@generated/data'

type UserUnitWithBuilding = Data.UserUnit & {
  unit: Data.Unit & { building: Data.Building }
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur',
  manager: 'Gestionnaire',
  owner: 'Propriétaire',
  tenant: 'Locataire',
  provider: 'Prestataire',
}

const props = defineProps<{
  profileUser: Data.User
  userUnits: UserUnitWithBuilding[]
  tickets: Data.Ticket[]
}>()

const roleLabel = computed(() => ROLE_LABELS[props.profileUser.role] ?? props.profileUser.role)

const notificationLabel = computed(() =>
  props.profileUser.notificationPreference === 'email' ? 'Email' : 'SMS'
)
</script>

<template>
  <Head :title="`${profileUser.firstName} ${profileUser.lastName}`" />

  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-gray-900">
          {{ profileUser.firstName }} {{ profileUser.lastName }}
        </h1>
        <p class="mt-1 text-sm text-gray-500">Fiche utilisateur</p>
      </div>
    </div>

    <div class="rounded-lg border border-gray-200 bg-white p-6">
      <div class="mb-4 text-sm uppercase tracking-wide text-gray-500">Informations</div>
      <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <dt class="text-xs uppercase tracking-wide text-gray-500">Email</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ profileUser.email }}</dd>
        </div>
        <div>
          <dt class="text-xs uppercase tracking-wide text-gray-500">Telephone</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ profileUser.phone }}</dd>
        </div>
        <div>
          <dt class="text-xs uppercase tracking-wide text-gray-500">Notifications</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ notificationLabel }}</dd>
        </div>
        <div>
          <dt class="text-xs uppercase tracking-wide text-gray-500">Position</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ roleLabel }}</dd>
        </div>
      </dl>
    </div>

    <div class="rounded-lg border border-gray-200 bg-white p-6">
      <div class="mb-3 text-xs uppercase tracking-wide text-gray-500">Unités associées</div>
      <ul class="space-y-2">
        <li
          v-for="userUnit in userUnits"
          :key="userUnit.id"
          class="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-800"
        >
          <div class="flex items-center justify-between transition">
            <div>{{ userUnit.unit.building.name }} / {{ userUnit.unit.label }}</div>
            <div class="ml-2 text-xs text-gray-500">({{ roleLabel }})</div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Bloc tickets existant -->
    <div class="rounded-lg border border-gray-200 bg-white p-6">
      <div class="mb-3 text-xs uppercase tracking-wide text-gray-500">Tickets existants</div>
      <ul class="space-y-2">
        <li
          v-for="ticket in tickets"
          :key="ticket.id"
          class="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-800"
        >
          <Link
            :href="`/tickets/${ticket.id}`"
            class="font-medium text-gray-700 hover:text-gray-900"
            >{{ ticket.title }}</Link
          >
          <span class="ml-2 text-xs text-gray-500">({{ ticket.category }})</span>
          <span class="ml-2 text-xs">
            <span :class="ticketPriorityBadgeClass(ticket.priority)">{{ ticket.priority }}</span>
          </span>
          <span class="ml-2 text-xs">
            <span class="badge badge-primary badge-outline">{{ ticket.status }}</span>
          </span>
          <span class="ml-2 text-xs text-gray-500">({{ ticket.createdAt }})</span>
        </li>
        <li v-if="tickets.length === 0">
          <div class="text-sm text-gray-400">Aucun ticket pour le moment</div>
        </li>
      </ul>
    </div>
  </div>
</template>
