<script setup lang="ts">
const { countsByStatus } = defineProps<{
  countsByStatus: { status: string; count: number }[]
}>()
</script>
<template>
  {{ console.log(countsByStatus) }}
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 mb-10">
    <div
      v-for="stat in countsByStatus"
      :key="stat.status"
      class="rounded-lg shadow-sm bg-white p-6 flex flex-col items-center justify-center"
    >
      <div class="text-4xl font-extrabold text-gray-900 mb-1">
        {{ stat.count }}
      </div>
      <div :class="['px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700']">
        {{ stat.status }}
      </div>
    </div>
  </div>
</template>
