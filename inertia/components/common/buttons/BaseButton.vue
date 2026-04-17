<script setup lang="ts">
import { computed, resolveComponent } from 'vue'
import type { Component } from 'vue'
import { Link } from '@adonisjs/inertia/vue'

const props = withDefaults(
  defineProps<{
    label: string
    icon?: Component | string
    route?: any
    class?: string
    params?: Record<string, any>
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  {
    type: 'button',
    disabled: false,
    params: () => ({}),
    class: '',
  }
)

const iconComponent = computed<Component | null>(() => {
  if (!props.icon) return null
  if (typeof props.icon !== 'string') return props.icon
  try {
    return resolveComponent(props.icon) as Component
  } catch {
    return null
  }
})
</script>

<template>
  <Link
    v-if="props.route"
    :route="props.route as any"
    :params="props.params"
    class="btn btn-primary m-1 items-center gap-1" :class="props.class">
    <component :is="iconComponent" v-if="iconComponent" class="size-5" />
    <span>{{ props.label }}</span>
  </Link>

  <button
    v-else
    :type="props.type"
    class="btn btn-primary items-center gap-1" :class="props.class"
    :disabled="props.disabled"
  >
    <component :is="iconComponent" v-if="iconComponent" class="size-5 text-base-content" />
    <span>{{ props.label }}</span>
  </button>
</template>