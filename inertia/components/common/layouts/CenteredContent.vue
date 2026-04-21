<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /**
     * Max width utility class for the inner container.
     * Examples: 'max-w-sm', 'max-w-xl'
     */
    maxWidthClass?: string
    /**
     * Allows keeping space for navbar/footer in layouts.
     */
    minHeightClass?: string
  }>(),
  {
    maxWidthClass: 'max-w-sm',
    minHeightClass: 'min-h-[calc(100vh-12rem)]',
  }
)
</script>

<template>
  <div class="flex items-center justify-center px-4" :class="props.minHeightClass">
    <div class="w-full" :class="props.maxWidthClass">
      <slot />
    </div>
  </div>
</template>
