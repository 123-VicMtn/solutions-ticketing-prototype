<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string
    bodyClass?: string
  }>(),
  {
    bodyClass: 'p-6',
  }
)
</script>

<template>
  <div class="card w-full bg-base-100 border border-base-300">
    <div class="card-body" :class="props.bodyClass">
      <div v-if="title || $slots.actions" class="flex items-start justify-between gap-3">
        <div v-if="title" class="text-xs uppercase tracking-wide text-secondary">
          {{ title }}
        </div>
        <div v-if="$slots.actions" class="shrink-0">
          <slot name="actions" />
        </div>
      </div>

      <slot />

      <div v-if="$slots.footer" class="card-actions justify-end pt-2">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
