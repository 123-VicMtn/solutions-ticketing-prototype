<script setup lang="ts">
import { ChevronDownIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  title: string
  buttonClass?: string
  menuClass?: string
}>()
</script>

<template>
  <div class="dropdown">
    <div
      tabindex="0"
      role="button"
      :class="props.buttonClass ?? 'btn m-1 flex items-center gap-2'"
    >
      <span class="">{{ props.title }}</span>
      <ChevronDownIcon class="size-4" />
    </div>
    <ul
      tabindex="-1"
      :class="
        props.menuClass ??
        'dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-lg'
      "
    >
      <slot />
    </ul>
  </div>
</template>

