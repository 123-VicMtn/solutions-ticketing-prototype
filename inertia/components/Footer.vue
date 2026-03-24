<script setup>
import { computed } from 'vue'

const props = defineProps({
  appName: {
    type: String,
    default: '123 Ticketing',
  },
  version: {
    type: String,
    default: 'v0.0.1',
  },
  links: {
    type: Array,
    default: () => [
      {
        label: 'Documentation',
        href: "https://github.com/123-VicMtn/solutions-ticketing-prototype/wiki/Plan-d'action",
      },
      {
        label: 'Support',
        href: 'https://github.com/123-VicMtn/solutions-ticketing-prototype/issues',
      },
      {
        label: 'Confidentialité',
        href: '',
      },
    ],
  },
})

const currentYear = computed(() => new Date().getFullYear())
</script>
<template>
  <footer class="border-t border-zinc-800/60 bg-zinc-950">
    <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-3">
        <span class="font-mono text-xs font-medium text-zinc-400 tracking-widest uppercase">
          {{ appName }}
        </span>
      </div>

      <nav class="flex items-center gap-5">
        <template v-for="(link, index) in links" :key="link.label">
          <a
            :href="link.href"
            class="text-xs text-zinc-400 hover:text-zinc-200 transition-colors duration-200"
          >
            {{ link.label }}
          </a>
          <span v-if="index < links.length - 1" class="w-px h-3 bg-zinc-800"></span>
        </template>
      </nav>

      <span class="text-xs text-zinc-400 font-light"> {{ currentYear }}</span>
    </div>
  </footer>
</template>
