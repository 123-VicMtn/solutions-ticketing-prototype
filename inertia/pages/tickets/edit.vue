<script setup lang="ts">
import { Head, router } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
import { ref } from 'vue'
import type { Data } from '@generated/data'
import BaseCard from '~/components/common/cards/BaseCard.vue'
import CenteredContent from '~/components/common/layouts/CenteredContent.vue'
import FormField from '~/components/common/forms/FormField.vue'
import BaseButton from '~/components/common/buttons/BaseButton.vue'

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
  <CenteredContent maxWidthClass="max-w-2xl" minHeightClass="min-h-[calc(100vh-10rem)]">
    <div class="mb-6">
      <Link route="tickets.show" :params="{ id: ticket.id }" class="text-sm text-muted">
        &larr; Retour au ticket
      </Link>
    </div>

    <div class="mb-6">
      <h1 class="text-2xl font-bold tracking-tight text-base-content">
        Modifier {{ ticket.reference }}
      </h1>
      <p class="mt-1 text-sm text-muted">
        {{ ticket.unit?.building?.name }} / {{ ticket.unit?.label }} — {{ ticket.category }}
      </p>
    </div>

    <BaseCard bodyClass="p-6 sm:p-8">
      <form class="space-y-5" @submit.prevent="submit">
        <FormField id="title" label="Titre" :error="errors.title">
          <input
            id="title"
            v-model="title"
            name="title"
            type="text"
            class="input input-bordered w-full placeholder-muted"
            :class="{ 'input-error': errors.title }"
          />
        </FormField>

        <FormField id="description" label="Description" :error="errors.description">
          <textarea
            id="description"
            v-model="description"
            name="description"
            rows="6"
            class="textarea textarea-bordered w-full placeholder-muted"
            :class="{ 'textarea-error': errors.description }"
          />
        </FormField>

        <FormField v-if="canModifyPriority" id="priority" label="Priorité">
          <select
            id="priority"
            v-model="priority"
            name="priority"
            class="select select-bordered w-full"
          >
            <option value="basse">Basse</option>
            <option value="moyenne">Moyenne</option>
            <option value="élevée">Élevée</option>
            <option value="urgente">Urgente</option>
          </select>
        </FormField>

        <div class="flex items-center justify-end gap-2">
          <BaseButton
            route="tickets.show"
            :params="{ id: ticket.id }"
            label="Annuler"
            variant="secondary"
            class="m-0"
          />
          <BaseButton
            type="submit"
            :disabled="processing"
            label="Enregistrer"
            class="m-0"
          />
        </div>
      </form>
    </BaseCard>
  </CenteredContent>
</template>
