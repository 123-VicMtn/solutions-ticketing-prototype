<script setup lang="ts">
import { useAuth } from '~/composables/use_auth'
import { Form } from '@adonisjs/inertia/vue'
import { Link } from '@adonisjs/inertia/vue'
import { Bars4Icon, BellIcon, Cog6ToothIcon, UserCircleIcon } from '@heroicons/vue/24/outline'

const { user } = useAuth()
const emit = defineEmits<{
  (e: 'toggle-sidebar'): void
}>()
</script>
<template>
  <div class="navbar bg-base-100 border-b border-base-200">
    <div class="navbar-start gap-1">
      <button
        type="button"
        class="btn btn-ghost btn-circle"
        aria-label="Réduire / étendre le menu"
        @click="emit('toggle-sidebar')"
      >
        <Bars4Icon class="size-6" />
      </button>

      <Link route="dashboard.index" class="btn btn-ghost gap-2 hover:none">
        <span class="inline-flex size-8 items-center justify-center rounded-lg text-primary-content">
            <img :src="'/resources/assets/images/logo.png'" alt="Logo" class="size-8 rounded" />
        </span>
        <span class="text-lg font-semibold">Ticketing</span>
      </Link>
    </div>

    <div class="navbar-center hidden lg:flex" />

    <div class="navbar-end gap-1">
      <Link route="tickets.index" class="btn btn-ghost btn-circle" aria-label="Notifications">
          <BellIcon class="size-6" />
      </Link>

      <Link
        route="users.show"
        :params="{ id: user?.id }"
        class="btn btn-ghost btn-circle"
        aria-label="Paramètres"
      >
        <Cog6ToothIcon class="size-6" />

      </Link>

      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar" aria-label="Menu utilisateur">
          <UserCircleIcon class="size-6" />
        </div>
        <ul
          tabindex="0"
          class="menu menu-md dropdown-content bg-base-100 rounded-box z-50 mt-3 w-56 p-2 shadow"
        >
          <li class="menu-title">
            <span class="truncate">{{ user?.fullName ?? user?.email ?? 'Compte' }}</span>
          </li>
          <li>
            <Link route="users.show" :params="{ id: user?.id }">Profil</Link>
          </li>
          <li>
            <Form route="session.destroy">
              <button type="submit" class="text-error">Déconnexion</button>
            </Form>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
