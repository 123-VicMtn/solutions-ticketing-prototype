<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '~/composables/use_auth'

type UserRole = 'tenant' | 'owner' | 'manager' | 'admin' | 'provider'

const props = defineProps<{
  min?: Exclude<UserRole, 'provider'>
  role?: UserRole | UserRole[]
}>()

const { can, isRole, isAuthenticated } = useAuth()

const allowed = computed(() => {
  if (!isAuthenticated.value) return false
  if (props.min) return can(props.min)
  if (props.role) {
    const roles = Array.isArray(props.role) ? props.role : [props.role]
    return isRole(...roles)
  }
  return true
})
</script>

<template>
  <slot v-if="allowed" />
</template>
