
<script setup lang="ts">
import { TICKET_STATUS_ORDER } from '~/utils/ticketStatus'

const { countsByStatus } = defineProps<{
  countsByStatus: { count: number; status: string }[]
}>()

const sortedCountsByStatus = countsByStatus.slice().sort(
  (a, b) => TICKET_STATUS_ORDER.indexOf(a.status.toLowerCase() as any) - TICKET_STATUS_ORDER.indexOf(b.status.toLowerCase() as any)
);

</script>
<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 mb-10">
      <div v-for="stat in sortedCountsByStatus" :key="stat.status" class="stats shadow">
        <div class="stat place-items-center">
          <div class="stat-title">
            <span class="badge badge-primary badge-outline">{{ stat.status }}</span>
          </div>
          <div class="stat-value">{{ stat.count }}</div>
        </div>
      </div>
    </div>
</template>
