<script setup lang="ts">
import { computed } from 'vue'
import Dropdown from './Dropdown.vue'

const props = withDefaults(
  defineProps<{
    title: string
    items: string[]
    modelValue?: string
    allLabel?: string
  }>(),
  {
    modelValue: '',
    allLabel: 'Tous',
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

function select(value: string) {
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<template>
  <Dropdown :title="`${props.title}`" class="">
    <li>
      <button type="button" :class="{ active: !props.modelValue }" @click="select('')">
        {{ props.allLabel }}
      </button>
    </li>
    <li v-for="item in props.items" :key="item">
      <button type="button" :class="{ active: props.modelValue === item }" @click="select(item)">
        {{ item }}
      </button>
    </li>
  </Dropdown>
</template>

