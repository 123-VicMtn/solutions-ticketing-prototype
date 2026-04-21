<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { Form, Link } from '@adonisjs/inertia/vue'
import BaseButton from '~/components/common/buttons/BaseButton.vue'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import BaseCard from '~/components/common/cards/BaseCard.vue'
import FormField from '~/components/common/forms/FormField.vue'
import type { Data } from '@generated/data'

defineProps<{
  building: Data.Building
}>()
</script>

<template>
  <Head :title="`Modifier ${building.name}`" />

  <div class="mx-auto w-full max-w-lg">
    <div class="mb-6">
      <Link route="admin.buildings.index" class="text-sm text-muted">
        <span class="inline-flex items-center gap-2">
          <ArrowLeftIcon class="size-4" />
          Retour aux immeubles
        </span>
      </Link>
    </div>

    <div class="mb-6">
      <h1 class="text-2xl font-bold tracking-tight text-base-content">Modifier l'immeuble</h1>
      <p class="mt-1 text-sm text-muted">{{ building.name }}</p>
    </div>

    <BaseCard bodyClass="p-6 sm:p-8">
      <Form
        route="admin.buildings.update"
        :params="{ id: building.id }"
        method="put"
        #default="{ processing, errors }"
        class="space-y-5"
      >
        <FormField id="name" label="Nom" :error="errors.name">
          <input
            id="name"
            name="name"
            type="text"
            :value="building.name"
            class="input input-bordered w-full text-base-content"
            :class="{ 'input-error': errors.name }"
          />
        </FormField>

        <FormField id="address" label="Adresse" :error="errors.address">
          <input
            id="address"
            name="address"
            type="text"
            :value="building.address"
            class="input input-bordered w-full text-base-content"
            :class="{ 'input-error': errors.address }"
          />
        </FormField>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="city" label="Ville" :error="errors.city">
            <input
              id="city"
              name="city"
              type="text"
              :value="building.city"
              class="input input-bordered w-full text-base-content"
              :class="{ 'input-error': errors.city }"
            />
          </FormField>

          <FormField id="postalCode" label="NPA" :error="errors.postalCode">
            <input
              id="postalCode"
              name="postalCode"
              type="text"
              :value="building.postalCode"
              class="input input-bordered w-full text-base-content"
              :class="{ 'input-error': errors.postalCode }"
            />
          </FormField>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <Link route="admin.buildings.index" class="btn btn-ghost">
            Annuler
          </Link>
          <BaseButton
            type="submit"
            :disabled="processing"
            label="Enregistrer"
            class="m-0"
          />
        </div>
      </Form>
    </BaseCard>
  </div>
</template>
