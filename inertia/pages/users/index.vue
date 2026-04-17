<script setup lang="ts">
import { Head, router } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
import {
  BuildingOffice2Icon,
  EnvelopeIcon,
  EyeIcon,
  HomeModernIcon,
  PhoneIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  UserIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/vue/24/outline'
import ZebraTable from '~/components/common/zebraTable.vue'
import DropdownFilter from '~/components/common/dropdowns/DropdownFilter.vue'
import type { Data } from '@generated/data'
import { ref } from 'vue'

const props = defineProps<{
  users: Data.User[]
  filters: { role?: Data.User['role'] }
}>()

type Role = Data.User['role']

function roleMeta(role?: Role) {
  switch (role) {
    case 'admin':
      return {
        label: 'Admin',
        icon: ShieldCheckIcon,
        chipClass: 'border-error/30 bg-error/10 text-error',
        dotClass: 'bg-error',
      }
    case 'manager':
      return {
        label: 'Manager',
        icon: BuildingOffice2Icon,
        chipClass: 'border-warning/30 bg-warning/10 text-warning',
        dotClass: 'bg-warning',
      }
    case 'owner':
      return {
        label: 'Propriétaire',
        icon: HomeModernIcon,
        chipClass: 'border-info/30 bg-info/10 text-info',
        dotClass: 'bg-info',
      }
    case 'provider':
      return {
        label: 'Prestataire',
        icon: WrenchScrewdriverIcon,
        chipClass: 'border-success/30 bg-success/10 text-success',
        dotClass: 'bg-success',
      }
    case 'tenant':
      return {
        label: 'Locataire',
        icon: UserIcon,
        chipClass: 'border-base-content/10 bg-base-200 text-base-content',
        dotClass: 'bg-base-content/60',
      }
    default:
      return {
        label: 'Utilisateur',
        icon: UserIcon,
        chipClass: 'border-base-content/10 bg-base-200 text-base-content',
        dotClass: 'bg-base-content/40',
      }
  }
}

const tableHeaders = [
  { key: 'firstName', label: 'Utilisateur' },
  { key: 'role', label: 'Rôle' },
  { key: 'contact', label: 'Mail & SMS' },
  { key: 'action', label: 'Actions', thClass: 'text-right', tdClass: 'text-right' },
]

const roles: Role[] = ['tenant', 'owner', 'manager', 'admin', 'provider']
const selectedRole = ref<Role | ''>(props.filters.role ?? '')

function applyFilters() {
  const role = selectedRole.value
  router.get('/users', { ...(role ? { role } : {}) }, { preserveState: true })
}
</script>

<template>
  <Head title="Utilisateurs" />

  <div>
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-base-content">Utilisateurs</h1>
      <p class="mt-1 text-sm text-muted">Gérez les utilisateurs de votre plateforme</p>
    </div>

    <div class="mt-6 flex w-full gap-3">
      <DropdownFilter
        v-model="selectedRole"
        title="Rôle"
        :items="roles"
        all-label="Tous"
        @change="applyFilters"
      />
    </div>

    <div class="mt-6">
      <ZebraTable :headers="tableHeaders" :rows="props.users" :rowKey="(u) => u.id">
        <template #cell:firstName="{ row: user }">
          <div class="min-w-0">
            <div class="flex items-center gap-3">
              <div class="min-w-0">
                <div class="truncate font-medium text-base-content">
                  {{ user.firstName }} {{ user.lastName }}
                </div>
                <div class="truncate text-sm text-muted">
                  {{ user.email }}
                </div>
              </div>
            </div>
          </div>
        </template>

        <template #cell:role="{ row: user }">
          <div class="inline-flex items-center">
            <div
              class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide"
              :class="roleMeta(user.role).chipClass"
            >
              <span class="inline-flex items-center gap-2">
                <component :is="roleMeta(user.role).icon" class="size-4" />
              </span>
              <span class="whitespace-nowrap">{{ roleMeta(user.role).label }}</span>
            </div>
          </div>
        </template>

        <template #cell:contact="{ row: user }">
          <div class="min-w-0 space-y-1">
            <div class="flex min-w-0 items-center gap-2">
              <EnvelopeIcon
                class="size-4 shrink-0"
                :class="user.notificationPreference === 'email' ? 'text-info' : 'text-muted'"
              />
              <span
                class="truncate text-sm"
                :class="user.notificationPreference === 'email' ? 'text-base-content' : 'text-muted'"
              >
                {{ user.email || '-' }}
              </span>
              <span v-if="user.notificationPreference === 'email'" class="badge badge-info badge-outline badge-sm">
                Préférence
              </span>
            </div>
            <div class="flex min-w-0 items-center gap-2">
              <PhoneIcon
                class="size-4 shrink-0"
                :class="user.notificationPreference === 'sms' ? 'text-success' : 'text-muted'"
              />
              <span
                class="truncate text-sm"
                :class="user.notificationPreference === 'sms' ? 'text-base-content' : 'text-muted'"
              >
                {{ user.phone || '-' }}
              </span>
              <span v-if="user.notificationPreference === 'sms'" class="badge badge-success badge-outline badge-sm">
                Préférence
              </span>
            </div>
          </div>
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
