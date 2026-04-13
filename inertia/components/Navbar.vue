<script setup lang="ts">
import { useAuth } from '~/composables/use_auth'
import { Form } from '@adonisjs/inertia/vue'
import { Link } from '@adonisjs/inertia/vue'
const { user } = useAuth()
</script>
<template>
  <div class="navbar bg-base-100 shadow-sm">
    <div class="navbar-start" />

    <div class="navbar-end">
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
          <div class="w-10 h-10 rounded-full bg-base-300 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </div>
        </div>
        <ul
          tabindex="-1"
          class="menu menu-md dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
        >
          <li>
            <Link
              route="users.show"
              :params="{ id: user?.id }"
              class="btn btn-ghost btn-block text-base-content hover:text-base-content"
            >
              Profil
            </Link>
          </li>
          <li>
            <Form route="session.destroy" class="contents">
              <button type="submit" class="btn btn-ghost btn-block text-red-500">
                Déconnexion
              </button>
            </Form>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
