<script setup lang="ts">
import { Link } from '@adonisjs/inertia/vue'
import RoleGate from '~/components/RoleGate.vue'
import { useAuth } from '~/composables/use_auth'

const { isAuthenticated, user } = useAuth()
</script>

<template>
  <div class="drawer">
    <input id="my-drawer-3" type="checkbox" class="drawer-toggle" />

    <div class="drawer-content min-w-0">
      <slot />
    </div>

    <div class="drawer-side">
      <label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay"></label>

      <aside class="bg-base-200 min-h-full w-auto p-4">
        <div class="mb-3 px-2">
          <div class="text-sm font-semibold">Navigation</div>
        </div>

        <ul class="menu menu-md rounded-box">
          <li class="menu-title"><span>Général</span></li>

          <template v-if="isAuthenticated">
            <li><Link route="dashboard.index">Tableau de bord</Link></li>
          </template>

          <li class="menu-title"><span>Tickets</span></li>
          <template v-if="isAuthenticated">
            <li><Link route="tickets.index">Tous les tickets</Link></li>
            <li><Link route="tickets.create">Créer un ticket</Link></li>
          </template>
          <template v-else>
            <li><Link route="session.create">Se connecter</Link></li>
            <li><Link route="request_access.create">Demander un accès</Link></li>
            <li><Link route="new_account.create">Créer un compte</Link></li>
          </template>

          <RoleGate min="manager">
            <li class="menu-title"><span>Manager</span></li>
            <li><Link route="manager.access_requests.index">Demandes d'accès</Link></li>
          </RoleGate>

          <RoleGate min="manager">
            <li class="menu-title"><span>Administration</span></li>
            <li><Link route="admin.buildings.index">Immeubles</Link></li>
            <li><Link route="admin.units.index">Lots</Link></li>
            <li><Link route="users.index">Utilisateurs</Link></li>
          </RoleGate>

          <template v-if="isAuthenticated">
            <li class="menu-title"><span>Compte</span></li>
            <li><Link route="users.show" :params="{ id: user?.id }">Mon profil</Link></li>
          </template>
        </ul>
      </aside>
    </div>
  </div>
</template>
