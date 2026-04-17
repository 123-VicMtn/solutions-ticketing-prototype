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
  canModifyPriority: boolean
  units: Data.Unit[]
}>()

const errors = ref<Record<string, string>>({})
const processing = ref(false)
const priorityDefault = 'moyenne'

async function submitTicket(event: Event) {
  const form = event.target as HTMLFormElement
  const data = new FormData(form)
  processing.value = true
  errors.value = {}

  router.post('/tickets', data, {
    forceFormData: true,
    onError: (e) => {
      errors.value = e as Record<string, string>
    },
    onFinish: () => {
      processing.value = false
    },
  })
}
</script>

<template>
  <Head title="Nouveau ticket" />
  <CenteredContent maxWidthClass="max-w-2xl" minHeightClass="min-h-[calc(100vh-10rem)]">
    <div class="mb-6">
      <Link route="tickets.index" class="text-sm text-muted">
        &larr; Retour aux tickets
      </Link>
    </div>

    <div class="mb-6">
      <h1 class="text-2xl font-bold tracking-tight text-base-content">Nouveau ticket</h1>
      <p class="mt-1 text-sm text-muted">Décrivez votre demande d'intervention</p>
    </div>

    <BaseCard bodyClass="p-6 sm:p-8">
      <form class="space-y-5" @submit.prevent="submitTicket">
        <FormField id="unitId" label="Lot concerné" :error="errors.unitId">
          <select
            name="unitId"
            id="unitId"
            class="select select-bordered w-full"
            :class="{ 'select-error': errors.unitId }"
          >
            <option value="">Sélectionner un lot</option>
            <option v-for="unit in units" :key="unit.id" :value="unit.id">
              {{ unit.building?.name }} - {{ unit.label }} ({{ unit.type }})
            </option>
          </select>
        </FormField>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="category" label="Catégorie" :error="errors.category">
            <select
              name="category"
              id="category"
              class="select select-bordered w-full"
              :class="{ 'select-error': errors.category }"
            >
              <option value="Technique & Maintenance">Technique & Maintenance</option>
              <option value="Entretien & Nettoyage">Entretien & Nettoyage</option>
              <option value="Administratifs & Contrats">Administratifs & Contrats</option>
              <option value="Finance & Facturation">Finance & Facturation</option>
              <option value="Relations & Conflits">Relations & Conflits</option>
              <option value="Gestion des accès">Gestion des accès</option>
              <option value="Déménagement">Déménagement</option>
              <option value="Urgences">Urgences</option>
            </select>
          </FormField>

          <FormField v-if="canModifyPriority" id="priority" label="Priorité" :error="errors.priority">
            <select
              name="priority"
              id="priority"
              class="select select-bordered w-full"
              :class="{ 'select-error': errors.priority }"
            >
              <option value="basse">Basse</option>
              <option value="moyenne">Moyenne</option>
              <option value="élevée">Élevée</option>
              <option value="urgente">Urgente</option>
            </select>
          </FormField>

          <input
            v-else
            type="hidden"
            name="priority"
            id="priority"
            :value="priorityDefault"
          />
        </div>

        <FormField id="title" label="Titre" :error="errors.title">
          <input
            name="title"
            id="title"
            type="text"
            class="input input-bordered w-full placeholder-muted"
            :class="{ 'input-error': errors.title }"
          />
        </FormField>

        <FormField id="description" label="Description" :error="errors.description">
          <textarea
            name="description"
            id="description"
            rows="5"
            class="textarea textarea-bordered w-full placeholder-muted"
            :class="{ 'textarea-error': errors.description }"
          />
        </FormField>

        <FormField id="attachments" label="Photos (optionnel)" :error="errors.attachments">
          <input
            name="attachments"
            id="attachments"
            type="file"
            multiple
            accept="image/*"
            class="file-input file-input-bordered w-full"
          />
          <p class="mt-1 text-xs text-muted">
            Formats acceptés: JPG, PNG, GIF — Taille maximale: 10MB
          </p>
        </FormField>

        <div class="flex justify-end">
          <BaseButton
            type="submit"
            :disabled="processing"
            label="Créer le ticket"
            class="m-0"
          />
        </div>
      </form>
    </BaseCard>
  </CenteredContent>
</template>
