<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { computed } from 'vue'
import { Link } from '@adonisjs/inertia/vue'

const props = defineProps<{
  profileUser: {
    id: number
    role: string
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

if (props.profileUser.role === 'admin') {
  props.profileUser.role = 'Administrateur'
} else if (props.profileUser.role === 'owner') {
  props.profileUser.role = 'Propriétaire'
} else {
  props.profileUser.role = 'Locataire'
}

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
          <dd class="mt-1 text-sm text-gray-900">{{ profileUser.role }}</dd>
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
          <Link :href="`/units/${userUnit.id}`">
            {{ userUnit.unit.building.name }} / {{ userUnit.unit.label }}
            <span class="ml-2 text-xs text-gray-500">({{ props.profileUser.role }})</span>
          </Link>
        </li>
      </ul>
    </div>

    <!-- Bloc tickets existant -->
    <div class="rounded-lg border border-gray-200 bg-white p-6">
      <div class="mb-3 text-xs uppercase tracking-wide text-gray-500">Tickets existants</div>
      <ul class="space-y-2">
        <li v-for="ticket in tickets" :key="ticket.id" class="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-800">
          <Link
          :href="`/tickets/${ticket.id}`"
          class="font-medium text-gray-700 hover:text-gray-900"
          >{{ ticket.title }}</Link>
          <span class="ml-2 text-xs text-gray-500">({{ ticket.category }})</span>
          <span class="ml-2 text-xs text-gray-500">({{ ticket.priority }})</span>
          <span class="ml-2 text-xs text-gray-500">({{ ticket.status }})</span>
          <span class="ml-2 text-xs text-gray-500">({{ ticket.createdAt }})</span>
        </li>
      </ul>
    </div>
  </div>
</template>
