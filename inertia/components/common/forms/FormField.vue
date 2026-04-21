<script setup lang="ts">
const props = defineProps<{
  id: string
  label: string
  error?: string
}>()
</script>
<template>
  <div>
    <label class="label py-1" :for="props.id">
      <span class="text-base-content">{{ props.label }}</span>
    </label>
    <slot />
    <p v-if="props.error" class="mt-1 text-sm text-error">
      {{ props.error }}
    </p>
  </div>
</template>