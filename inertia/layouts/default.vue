<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import Navbar from '~/layouts/Navbar.vue'
import { useFlash } from '~/composables/use_flash'
import { useAuth } from '~/composables/use_auth'
import Footer from '~/layouts/Footer.vue'
import Sidebar from '~/layouts/SideBar.vue'
import { ref } from 'vue'

useFlash()
const { user, isAuthenticated } = useAuth()
const isSidebarCollapsed = ref(false)
</script>

<template>
  <div class="h-screen flex flex-col overflow-hidden">
    <Navbar
      v-if="isAuthenticated"
      class="shrink-0 w-full z-50"
      @toggle-sidebar="isSidebarCollapsed = !isSidebarCollapsed"
    />

    <div v-if="isAuthenticated" class="flex-1 min-h-0 flex">
      <Sidebar :collapsed="isSidebarCollapsed" />

      <main class="flex-1 min-w-0 overflow-y-auto">
        <div class="mx-auto w-full px-6 py-4">
          <RoleGate :min="user?.role">
            <slot />
          </RoleGate>
        </div>
      </main>
    </div>

    <div v-else class="flex-1 min-h-0 overflow-y-auto">
      <main class="mx-auto w-full px-6 py-4">
        <slot />
      </main>
    </div>

    <Toaster position="top-center" rich-colors />
    <Footer class="shrink-0" />
  </div>
</template>
