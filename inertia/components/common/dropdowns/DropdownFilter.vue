<script setup lang="ts">
import Dropdown from './Dropdown.vue'

type DropdownItem = string | { label: string; value: string }

const props = withDefaults(
  defineProps<{
    title: string
    items: DropdownItem[]
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

function itemLabel(item: DropdownItem): string {
  return typeof item === 'string' ? item : item.label
}

function itemValue(item: DropdownItem): string {
  return typeof item === 'string' ? item : item.value
}

function currentLabel(): string {
  if (!props.modelValue) return props.allLabel
  const match = props.items.find((i) => itemValue(i) === props.modelValue)
  return match ? itemLabel(match) : props.modelValue
}

function select(value: string) {
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<template>
  <Dropdown :title="`${props.title}` + ' : ' + currentLabel()" class="">
    <li>
      <button type="button" :class="{ active: !props.modelValue }" @click="select('')">
        {{ props.allLabel }}
      </button>
    </li>
    <li v-for="item in props.items" :key="itemValue(item)">
      <button
        onclick="document.activeElement.blur()"
        type="button"
        :class="{ active: props.modelValue === itemValue(item) }"
        @click="select(itemValue(item))"
      >
        {{ itemLabel(item) }}
      </button>
    </li>
  </Dropdown>
</template>

