<script setup>
import { computed, onMounted, ref } from 'vue'

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

const STORAGE_KEY = 'theme'
const mode = ref('light') // 'light' | 'dark' (stored)
const isDark = computed(() => mode.value === 'dark')

function applyTheme(nextMode) {
  mode.value = nextMode
  document.documentElement.dataset.theme = nextMode === 'dark' ? 'dark-custom' : 'light-custom'
  localStorage.setItem(STORAGE_KEY, nextMode)
}

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') {
    applyTheme(saved)
    return
  }

  applyTheme('light')
})
</script>
<template>
  <footer class="relative z-20 w-full border-t border-base-300 bg-base-200">
    <div class="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-3">
        <span class="font-mono text-xs font-medium text-base-content/70 tracking-widest uppercase">
          {{ appName }}
        </span>
      </div>

      <nav class="flex items-center gap-5">
        <template v-for="(link, index) in links" :key="link.label">
          <a
            :href="link.href"
            class="text-xs text-base-content/70 hover:text-base-content transition-colors duration-200"
          >
            {{ link.label }}
          </a>
          <span v-if="index < links.length - 1" class="w-px h-3 bg-base-300"></span>
        </template>
      </nav>

      <div class="flex items-center gap-4">
        <label class="flex items-center gap-2 text-xs text-base-content/70 select-none">
          <span>Clair</span>
          <input
            type="checkbox"
            class="toggle toggle-sm"
            aria-label="Toggle dark mode"
            :checked="isDark"
            @change="applyTheme($event.target?.checked ? 'dark' : 'light')"
          />
          <span>Sombre</span>
        </label>
      </div>
    </div>
  </footer>
</template>
