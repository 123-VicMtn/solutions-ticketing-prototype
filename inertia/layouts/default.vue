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
  <div class="min-h-screen flex flex-col">
    <Navbar
      v-if="isAuthenticated"
      class="sticky top-0 z-50 w-full"
      @toggle-sidebar="isSidebarCollapsed = !isSidebarCollapsed"
    />

    <Sidebar v-if="isAuthenticated" class="flex-1 min-h-0" :collapsed="isSidebarCollapsed">
      <div class="h-full min-h-0 flex flex-col">
        <main class="mx-auto w-full flex-1 px-6 py-4">
          <RoleGate :min="user?.role">
            <slot />
          </RoleGate>
        </main>
        <Toaster position="top-center" rich-colors />
      </div>
    </Sidebar>

    <div v-else class="flex-1 flex flex-col">
      <main class="mx-auto w-full flex-1 px-6 py-4">
        <slot />
      </main>
      <Toaster position="top-center" rich-colors />
    </div>

    <Footer />
  </div>
</template>
