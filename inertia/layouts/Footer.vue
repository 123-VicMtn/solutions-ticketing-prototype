<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { MoonIcon, SunIcon } from '@heroicons/vue/24/outline'

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
const isDark = ref(false)

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  isDark.value = saved === 'dark-custom'
  document.documentElement.dataset.theme = isDark.value ? 'dark-custom' : 'light-custom'
})

watch(isDark, (next) => {
  const theme = next ? 'dark-custom' : 'light-custom'
  localStorage.setItem(STORAGE_KEY, theme)
  document.documentElement.dataset.theme = theme
})
</script>
<template>
  <footer class="relative z-20 w-full border-t border-base-300 bg-base-200">
    <div class="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-3">
        <span class="font-mono text-xs font-medium text-muted tracking-widest uppercase">
          {{ appName }}
        </span>
      </div>

      <nav class="flex items-center gap-5">
        <template v-for="(link, index) in links" :key="link.label">
          <a
            :href="link.href"
            class="text-xs text-muted hover:text-base-content transition-colors duration-200"
          >
            {{ link.label }}
          </a>
          <span v-if="index < links.length - 1" class="w-px h-3 bg-base-300"></span>
        </template>
      </nav>

      <div class="flex items-center">
        <p class="text-xs text-muted mr-2">Thème</p>
        <label class="toggle">
          
          <input
            type="checkbox"
            class="theme-controller"
            value="dark-custom"
            v-model="isDark"
          />
          <SunIcon class="text-warning" aria-label="Thème clair" />
          <MoonIcon class="text-primary" aria-label="Thème sombre" />
        </label>
      </div>
    </div>
  </footer>
</template>
