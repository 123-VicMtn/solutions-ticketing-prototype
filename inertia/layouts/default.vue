<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import Navbar from '~/layouts/Navbar.vue'
import { useFlash } from '~/composables/use_flash'
import { useAuth } from '~/composables/use_auth'
import Footer from '~/layouts/Footer.vue'
import Sidebar from '~/layouts/SideBar.vue'

useFlash()
const { user, isAuthenticated } = useAuth()
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Navbar v-if="isAuthenticated" class="sticky top-0 z-50 w-full" />

    <Sidebar v-if="isAuthenticated" class="flex-1">
      <div class="min-h-full flex flex-col">
        <main class="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
          <RoleGate :min="user?.role">
            <slot />
          </RoleGate>
        </main>
        <Toaster position="top-center" rich-colors />
      </div>
    </Sidebar>

    <div v-else class="flex-1 flex flex-col">
      <main class="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <slot />
      </main>
      <Toaster position="top-center" rich-colors />
    </div>

    <Footer />
  </div>
</template>
