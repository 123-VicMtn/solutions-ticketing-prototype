<script setup lang="ts">
import type { Component } from 'vue'
import { Link } from '@adonisjs/inertia/vue'

const props = defineProps<{
  route: any
  params?: Record<string, any>
  icon: Component
  ariaLabel: string
  title?: string
}>()
</script>

<template>
  <Link
    :route="props.route"
    :params="props.params"
    class="btn btn-ghost btn-sm"
    :aria-label="props.ariaLabel"
    :title="props.title ?? props.ariaLabel"
  >
    <component :is="props.icon" class="size-5" />
  </Link>
</template>

