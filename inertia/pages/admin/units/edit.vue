<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { Form, Link } from '@adonisjs/inertia/vue'
import type { Data } from '@generated/data'
import BaseButton from '~/components/common/buttons/BaseButton.vue'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import BaseCard from '~/components/common/cards/BaseCard.vue'
import FormField from '~/components/common/forms/FormField.vue'

defineProps<{
  unit: Data.Unit & { building?: Data.Building.Variants['forSummary'] | null }
  buildings: Data.Building.Variants['forSummary'][]
}>()
</script>

<template>
  <Head :title="`Modifier ${unit.label}`" />

  <div class="mx-auto w-full max-w-lg">
    <div class="mb-6">
      <Link route="admin.units.index" class="text-sm text-muted">
        <span class="inline-flex items-center gap-2">
          <ArrowLeftIcon class="size-4" />
          Retour aux lots
        </span>
      </Link>
    </div>

    <div class="mb-6">
      <h1 class="text-2xl font-bold tracking-tight text-base-content">Modifier le lot</h1>
      <p class="mt-1 text-sm text-muted">
        {{ unit.label }} — {{ unit.building?.name ?? 'Immeuble inconnu' }}
      </p>
    </div>

    <BaseCard bodyClass="p-6 sm:p-8">
      <Form
        route="admin.units.update"
        :params="{ id: unit.id }"
        method="put"
        #default="{ processing, errors }"
        class="space-y-5"
      >
        <FormField id="label" label="Label" :error="errors.label">
          <input
            id="label"
            name="label"
            type="text"
            :value="unit.label"
            class="input input-bordered w-full text-base-content"
            :class="{ 'input-error': errors.label }"
          />
        </FormField>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="floor" label="Étage" :error="errors.floor">
            <input
              id="floor"
              name="floor"
              type="number"
              :value="unit.floor"
              class="input input-bordered w-full text-base-content"
              :class="{ 'input-error': errors.floor }"
            />
          </FormField>

          <FormField id="type" label="Type" :error="errors.type">
            <select
              id="type"
              name="type"
              class="select select-bordered w-full text-base-content"
              :class="{ 'select-error': errors.type }"
            >
              <option value="apartment" :selected="unit.type === 'apartment'">Appartement</option>
              <option value="commercial" :selected="unit.type === 'commercial'">Commercial</option>
              <option value="parking" :selected="unit.type === 'parking'">Parking</option>
              <option value="storage" :selected="unit.type === 'storage'">Cave</option>
            </select>
          </FormField>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <Link route="admin.units.index" class="btn btn-ghost">
            Annuler
          </Link>
          <BaseButton type="submit" :disabled="processing" label="Enregistrer" class="m-0" />
        </div>
      </Form>
    </BaseCard>
  </div>
</template>
