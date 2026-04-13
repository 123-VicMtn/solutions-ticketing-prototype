<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import Navbar from '~/components/Navbar.vue'
import { useFlash } from '~/composables/use_flash'
import { useAuth } from '~/composables/use_auth'
import Footer from '~/components/Footer.vue'
import SideBar from '~/components/SideBar.vue'

useFlash()
const { user, isAuthenticated } = useAuth()
</script>

<template>
  <SideBar v-if="isAuthenticated">
    <div class="min-h-screen flex flex-col">
      <Navbar />
      <main class="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <RoleGate :min="user?.role">
          <slot />
        </RoleGate>
      </main>
      <Toaster position="top-center" rich-colors />
      <Footer />
    </div>
  </SideBar>

  <div v-else class="min-h-screen flex flex-col">
    <main class="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
      <slot />
    </main>
    <Toaster position="top-center" rich-colors />
    <Footer />
  </div>
</template>
