<script setup lang="ts">
type Header = {
  key: string
  label: string
  thClass?: string
  tdClass?: string
}

const props = defineProps<{
  headers: Array<Header>
  rows: any[]
  rowKey?: (row: any, index: number) => string | number
}>()

function getRowKey(row: any, index: number) {
  return props.rowKey ? props.rowKey(row, index) : index
}
</script>
<template>
  <div class="overflow-x-auto">
    <table class="table table-zebra">
      <thead>
        <tr>
          <th v-for="header in headers" :key="header.key" :class="header.thClass">
            {{ header.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in rows" :key="getRowKey(row, index)">
          <td v-for="header in headers" :key="header.key" :class="header.tdClass">
            <slot
              :name="`cell:${header.key}`"
              :row="row"
              :value="row?.[header.key]"
              :header="header"
              :index="index"
            >
              {{ row?.[header.key] ?? '-' }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
