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
  KeyIcon,
} from '@heroicons/vue/24/outline'

const { isAuthenticated } = useAuth()

defineProps<{
  collapsed: boolean
}>()
</script>

<template>
  <aside
    class="bg-base-200 border-r border-base-300 shrink-0 h-full flex flex-col overflow-x-hidden overflow-y-auto transition-[width] duration-200 ease-out"
    :class="collapsed ? 'w-min' : 'w-auto'"
    aria-label="Menu latéral"
  >
    <ul
      class="menu menu-vertical gap-1 w-full flex-nowrap"
      :class="collapsed ? 'px-1 py-3' : 'px-3 py-4'"
    >
      <li class="menu-title" v-if="!collapsed"><span>Général</span></li>

      <template v-if="isAuthenticated">
        <li>
          <Link route="dashboard.index" :class="collapsed ? 'justify-center tooltip tooltip-right' : ''" :data-tip="collapsed ? 'Tableau de bord' : undefined">
            <HomeIcon class="size-5 shrink-0" />
            <span v-if="!collapsed" class="truncate">Tableau de bord</span>
          </Link>
        </li>
      </template>

      <li class="menu-title" v-if="!collapsed"><span>Tickets</span></li>
      <template v-if="isAuthenticated">
        <li>
          <Link route="tickets.index" :class="collapsed ? 'justify-center tooltip tooltip-right' : ''" :data-tip="collapsed ? 'Tous les tickets' : undefined">
            <TicketIcon class="size-5 shrink-0" />
            <span v-if="!collapsed" class="truncate">Tous les tickets</span>
          </Link>
        </li>
        <li v-if="!collapsed">
          <Link
            href="/tickets?assignedTo=me"
          >
            <TicketIcon class="size-5 shrink-0" />
            <span class="truncate">Mes tiquets</span>
          </Link>
        </li>
        <li>
          <Link route="tickets.create" :class="collapsed ? 'justify-center tooltip tooltip-right' : ''" :data-tip="collapsed ? 'Créer un ticket' : undefined">
            <PlusCircleIcon class="size-5 shrink-0" />
            <span v-if="!collapsed" class="truncate">Créer un ticket</span>
          </Link>
        </li>
      </template>
      <template v-else>
        <li>
          <Link route="session.create" :class="collapsed ? 'justify-center tooltip tooltip-right' : ''" :data-tip="collapsed ? 'Se connecter' : undefined">
            <HomeIcon class="size-5 shrink-0" />
            <span v-if="!collapsed" class="truncate">Se connecter</span>
          </Link>
        </li>
      </template>

      <RoleGate min="manager">
        <li class="menu-title" v-if="!collapsed"><span>Administration</span></li>
        <li>
          <Link route="admin.buildings.index" :class="collapsed ? 'justify-center tooltip tooltip-right' : ''" :data-tip="collapsed ? 'Objets Immobiliers' : undefined">
            <BuildingOffice2Icon class="size-5 shrink-0" />
            <span v-if="!collapsed" class="truncate">Objets Immobiliers</span>
          </Link>
        </li>
      </RoleGate>

      <RoleGate min="admin">
        <li class="menu-title" v-if="!collapsed"><span>Gestion</span></li>
        <li>
          <Link route="users.index" :class="collapsed ? 'justify-center tooltip tooltip-right' : ''" :data-tip="collapsed ? 'Utilisateurs' : undefined">
            <UsersIcon class="size-5 shrink-0" />
            <span v-if="!collapsed" class="truncate">Utilisateurs</span>
          </Link>
        </li>
        <li>
          <Link route="manager.access_requests.index" :class="collapsed ? 'justify-center tooltip tooltip-right' : ''" :data-tip="collapsed ? 'Demandes d\'accès' : undefined">
            <KeyIcon class="size-5 shrink-0" />
            <span v-if="!collapsed" class="truncate">Demandes d'accès</span>
          </Link>
        </li>
      </RoleGate>
    </ul>
  </aside>
</template>
