<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
import { EyeIcon, PencilSquareIcon } from '@heroicons/vue/24/outline'
import ZebraTable from '~/components/common/zebraTable.vue'

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

const tableHeaders = [
  { key: 'firstName', label: 'Prénom' },
  { key: 'lastName', label: 'Nom' },
  { key: 'email', label: 'E-mail' },
  { key: 'lots', label: 'Lots' },
  { key: 'action', label: 'Actions', thClass: 'text-right', tdClass: 'text-right' },
]
</script>

<template>
  <Head title="Utilisateurs" />

  <div>
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-gray-900">Utilisateurs</h1>
      <p class="mt-1 text-sm text-gray-500">Gérez les utilisateurs de votre plateforme</p>
    </div>

    <div class="mt-6">
      <ZebraTable :headers="tableHeaders" :rows="props.users" :rowKey="(u) => u.id">
        <template #cell:lots="{ row: user }">
          {{ userUnitLabel(user) }}
        </template>

        <template #cell:action="{ row: user }">
          <div class="inline-flex items-center justify-end gap-2">
            <Link
              route="users.show"
              :params="{ id: user.id }"
              class="btn btn-ghost btn-sm"
              aria-label="Voir"
              title="Voir"
            >
              <EyeIcon class="size-5" />
            </Link>
            <Link
              route="users.edit"
              :params="{ id: user.id }"
              class="btn btn-ghost btn-sm"
              aria-label="Modifier"
              title="Modifier"
            >
              <PencilSquareIcon class="size-5" />
            </Link>
          </div>
        </template>
      </ZebraTable>
    </div>
  </div>  
</template>
