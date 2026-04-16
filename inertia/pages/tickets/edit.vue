<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3'
import { ref } from 'vue'
import type { Data } from '@generated/data'

const props = defineProps<{
  ticket: Data.Ticket
  canModifyPriority: boolean
}>()

const title = ref(props.ticket.title)
const description = ref(props.ticket.description)
const priority = ref(props.ticket.priority)
const errors = ref<Record<string, string>>({})
const processing = ref(false)

function submit() {
  processing.value = true
  errors.value = {}

  router.put(
    `/tickets/${props.ticket.id}`,
    {
      title: title.value,
      description: description.value,
      ...(props.canModifyPriority ? { priority: priority.value } : {}),
    },
    {
      onError: (e) => {
        errors.value = e as Record<string, string>
      },
      onFinish: () => {
        processing.value = false
      },
    }
  )
}
</script>

<template>
  <Head :title="`Modifier ${ticket.reference ?? 'Ticket'}`" />
  <div class="mx-auto max-w-2xl">
    <div class="mb-6">
      <Link :href="`/tickets/${ticket.id}`" class="text-sm text-gray-500 hover:text-gray-900">
        &larr; Retour au ticket
      </Link>
    </div>

    <h1 class="text-2xl font-bold tracking-tight text-gray-900">
      Modifier {{ ticket.reference }}
    </h1>
    <p class="mt-1 text-sm text-gray-500">
      {{ ticket.unit?.building?.name }} / {{ ticket.unit?.label }} — {{ ticket.category }}
    </p>

    <form class="mt-8 space-y-5" @submit.prevent="submit">
      <div>
        <label for="title" class="mb-1.5 block text-sm font-medium text-gray-700">Titre</label>
        <input
          id="title"
          v-model="title"
          name="title"
          type="text"
          class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
          :class="{ 'border-red-500': errors.title }"
        />
        <p v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title }}</p>
      </div>

      <div>
        <label for="description" class="mb-1.5 block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          v-model="description"
          name="description"
          rows="6"
          class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
          :class="{ 'border-red-500': errors.description }"
        />
        <p v-if="errors.description" class="mt-1 text-sm text-red-600">
          {{ errors.description }}
        </p>
      </div>

      <div v-if="canModifyPriority">
        <label for="priority" class="mb-1.5 block text-sm font-medium text-gray-700">
          Priorité
        </label>
        <select
          id="priority"
          v-model="priority"
          name="priority"
          class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
        >
          <option value="basse">Basse</option>
          <option value="moyenne">Moyenne</option>
          <option value="élevée">Élevée</option>
          <option value="urgente">Urgente</option>
        </select>
      </div>

      <div class="flex items-center justify-end gap-3">
        <Link
          :href="`/tickets/${ticket.id}`"
          class="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </Link>
        <button
          type="submit"
          :disabled="processing"
          class="cursor-pointer rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Enregistrer
        </button>
      </div>
    </form>
  </div>
</template>
