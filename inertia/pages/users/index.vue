<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
import { computed } from 'vue'

const props = defineProps<{
  users: Array<{
    id: number
    firstName: string
    lastName: string
    email: string
    userUnits: Array<{
      id: number
      unit: {
        id: number
        label: string
      }
    }>
  }>
}>()

const userUnitLabel = (user: { userUnits: Array<{ unit: { label: string } }> }) => {
  if (user.userUnits.length > 1) {
    return 'Plusieurs lots'
  }
  return user.userUnits[0]?.unit?.label ?? ''
}
</script>

<template>
  <Head title="Utilisateurs" />

  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-gray-900">Utilisateurs</h1>
      <p class="mt-1 text-sm text-gray-500">Gérez les utilisateurs de votre plateforme</p>
    </div>

    <div class="rounded-lg border border-gray-200 bg-white p-6">
      <div class="overflow-x-auto mb-6">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Prénom
              </th>
              <th
                class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Nom
              </th>
              <th
                class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                E-mail
              </th>
              <th
                class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Lots
              </th>
              <th class="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id">
              <td class="px-4 py-2 whitespace-nowrap">{{ user.firstName }}</td>
              <td class="px-4 py-2 whitespace-nowrap">{{ user.lastName }}</td>
              <td class="px-4 py-2 whitespace-nowrap text-gray-600">{{ user.email }}</td>
              <td class="px-4 py-2 whitespace-nowrap text-gray">
                {{ userUnitLabel(user) }}
              </td>
              <td class="px-4 py-2 whitespace-nowrap text-right">
                <Link
                  route="users.edit"
                  :params="{ id: user.id }"
                  class="hover:underline text-sm font-medium"
                >
                  Modifier
                </Link>
              </td>
              <td class="px-4 py-2 whitespace-nowrap text-right">
                <Link
                  route="users.show"
                  :params="{ id: user.id }"
                  class="hover:underline text-sm font-medium"
                >
                  Voir
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
