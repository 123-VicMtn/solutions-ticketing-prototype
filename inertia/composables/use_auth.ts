import { computed } from 'vue'
import { usePage } from '@inertiajs/vue3'
import type { Data } from '@generated/data'

type UserRole = 'tenant' | 'owner' | 'manager' | 'admin' | 'provider'

const HIERARCHY: Exclude<UserRole, 'provider'>[] = ['tenant', 'owner', 'manager', 'admin']

export function useAuth() {
  const page = usePage<Data.SharedProps>()

  const user = computed(() => page.props.user)
  const isAuthenticated = computed(() => !!user.value)
  const isProvider = computed(() => user.value?.role === 'provider')

  function hasAtLeastRole(min: Exclude<UserRole, 'provider'>): boolean {
    if (!user.value) return false
    if (user.value.role === 'provider') return false
    return (
      HIERARCHY.indexOf(user.value.role as Exclude<UserRole, 'provider'>) >= HIERARCHY.indexOf(min)
    )
  }

  function can(min: Exclude<UserRole, 'provider'>): boolean {
    return hasAtLeastRole(min)
  }

  function isRole(...roles: UserRole[]): boolean {
    if (!user.value) return false
    return roles.includes(user.value.role as UserRole)
  }

  return {
    user,
    isAuthenticated,
    isProvider,
    hasAtLeastRole,
    can,
    isRole,
  }
}
