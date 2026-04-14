
<script setup lang="ts">
const { countsByStatus } = defineProps<{
  countsByStatus: { count: number; status: string }[]
}>()

function getBadgeColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'ouvert':
      return 'stat-title badge badge-info';
    case 'assigné':
      return 'stat-title badge badge-accent';
    case 'en cours':
      return 'stat-title badge badge-warning';
    case 'terminé':
      return 'stat-title badge badge-soft badge-outline  badge-success';
    case 'résolu':
      return 'stat-title badge badge-success';
    case 'fermé':
      return 'stat-title badge badge-error';
    default:
      return 'stat-title badge badge-neutral';
  }
}

const statusOrder = ['ouvert', 'assigné', 'en cours', 'terminé', 'résolu', 'fermé'];
const sortedCountsByStatus = countsByStatus.slice().sort(
  (a, b) => statusOrder.indexOf(a.status.toLowerCase()) - statusOrder.indexOf(b.status.toLowerCase())
);

</script>
<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 mb-10">
      <div v-for="stat in sortedCountsByStatus" :key="stat.status" class="stats shadow">
        <div class="stat place-items-center">
          <div :class="getBadgeColor(stat.status)">{{ stat.status }}</div>
          <div class="stat-value">{{ stat.count }}</div>
        </div>
      </div>
    </div>
</template>
