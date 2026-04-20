<script setup lang="ts">
import { computed, resolveComponent } from 'vue'
import type { Component } from 'vue'
import { Link } from '@adonisjs/inertia/vue'

const props = withDefaults(
  defineProps<{
    label: string
    icon?: Component | string
    route?: any
    href?: string
    target?: string
    rel?: string
    class?: string
    params?: Record<string, any>
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    variant?: string
  }>(),
  {
    type: 'button',
    disabled: false,
    params: () => ({}),
    class: '',
    variant: 'primary',
    target: '_blank',
    rel: 'noopener noreferrer',
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

const variantClass = computed(() => (props.variant ? `btn-${props.variant}` : 'btn-primary'))
</script>

<template>
  <Link
    v-if="props.route"
    :route="props.route as any"
    :params="props.params"
    class="btn m-1 items-center gap-1"
    :class="[variantClass, props.class]"
  >
    <component :is="iconComponent" v-if="iconComponent" class="size-5" />
    <span>{{ props.label }}</span>
  </Link>

  <a
    v-else-if="props.href"
    :href="props.href"
    class="btn m-1 items-center gap-1"
    :class="[variantClass, props.class]"
    :target="props.target"
    :rel="props.rel"
    :aria-disabled="props.disabled ? 'true' : undefined"
    @click="props.disabled ? $event.preventDefault() : undefined"
  >
    <component :is="iconComponent" v-if="iconComponent" class="size-5" />
    <span>{{ props.label }}</span>
  </a>

  <button
    v-else
    :type="props.type"
    class="btn items-center gap-1"
    :class="[variantClass, props.class]"
    :disabled="props.disabled"
  >
    <component :is="iconComponent" v-if="iconComponent" class="size-5 text-base-content" />
    <span>{{ props.label }}</span>
  </button>
</template>