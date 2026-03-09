<script setup lang="ts">
import { watch } from 'vue'
import { usePage } from '@inertiajs/vue3'
import { toast, Toaster } from 'vue-sonner'
import type { Data } from '@generated/data'
import { Link, Form } from '@adonisjs/inertia/vue'

const page = usePage<Data.SharedProps>()

watch(
  () => page.url,
  () => toast.dismiss()
)

watch(
  () => page.props.flash.error,
  (error) => {
    if (error) toast.error(error)
  },
  { immediate: true }
)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="border-b border-gray-200 bg-white">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link route="home" class="text-xl font-bold tracking-tight text-gray-900">
          Ticketing
        </Link>

        <nav class="flex items-center gap-4">
          <template v-if="page.props.user">
            <span
              class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-medium text-white"
            >
              {{ page.props.user.initials }}
            </span>
            <Form route="session.destroy">
              <button
                type="submit"
                class="cursor-pointer text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Déconnexion
              </button>
            </Form>
          </template>
          <template v-else>
            <Link
              route="session.create"
              class="text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              Connexion
            </Link>
            <Link
              route="new_account.create"
              class="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Créer un compte
            </Link>
          </template>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-6 py-8">
      <slot />
    </main>

    <Toaster position="top-center" rich-colors />
  </div>
</template>
