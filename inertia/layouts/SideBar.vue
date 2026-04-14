<script setup lang="ts">
import { Link } from '@adonisjs/inertia/vue'
import RoleGate from '~/components/RoleGate.vue'
import { useAuth } from '~/composables/use_auth'
import {
  BuildingOffice2Icon,
  HomeIcon,
  PlusCircleIcon,
  TicketIcon,
  UsersIcon,
} from '@heroicons/vue/24/outline'

const { isAuthenticated } = useAuth()

defineProps<{
  collapsed: boolean
}>()
</script>

<template>
  <div class="flex flex-1 min-h-0 min-w-0">
    <aside
      class="bg-base-200 border-r border-base-300 shrink-0 self-stretch flex flex-col"
      :class="collapsed ? 'w-auto py-3' : 'w-auto px-3 py-4'"
      aria-label="Menu latéral"
    >
      <ul class="menu menu-vertical gap-1">
        <li class="menu-title" v-if="!collapsed"><span>Général</span></li>

        <template v-if="isAuthenticated">
          <li>
            <Link route="dashboard.index">
              <HomeIcon class="size-5" />
              <span v-if="!collapsed">Tableau de bord</span>
            </Link>
          </li>
        </template>

        <li class="menu-title" v-if="!collapsed"><span>Tickets</span></li>
        <template v-if="isAuthenticated">
          <li>
            <Link route="tickets.index">
              <TicketIcon class="size-5" />
              <span v-if="!collapsed">Tous les tickets</span>
            </Link>
          </li>
          <li>
            <Link route="tickets.create">
              <PlusCircleIcon class="size-5" />
              <span v-if="!collapsed">Créer un ticket</span>
            </Link>
          </li>
        </template>
        <template v-else>
          <li>
            <Link route="session.create">
              <HomeIcon class="size-5" />
              <span v-if="!collapsed">Se connecter</span>
            </Link>
          </li>
        </template>

        <RoleGate min="manager">
          <li class="menu-title" v-if="!collapsed"><span>Administration</span></li>
          <li>
            <Link route="admin.buildings.index">
              <BuildingOffice2Icon class="size-5" />
              <span v-if="!collapsed">Immeubles</span>
            </Link>
          </li>
          <li>
            <Link route="users.index">
              <UsersIcon class="size-5" />
              <span v-if="!collapsed">Utilisateurs</span>
            </Link>
          </li>
        </RoleGate>
      </ul>
    </aside>

    <div class="min-w-0 flex-1">
      <slot />
    </div>
  </div>
</template>
