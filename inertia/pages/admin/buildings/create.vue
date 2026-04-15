<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { Form, Link } from '@adonisjs/inertia/vue'
import BaseCard from '~/components/common/cards/BaseCard.vue'
import FormField from '~/components/common/forms/FormField.vue'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <Head title="Nouvel immeuble" />

  <div class="mx-auto w-full max-w-lg">
    <div class="mb-6">
      <Link route="admin.buildings.index" class="text-sm text-gray-500 hover:text-gray-900">
        <span class="inline-flex items-center gap-2"><ArrowLeftIcon class="size-4" />Retour aux immeubles</span>
      </Link>
    </div>

    <div class="mb-6">
      <h1 class="text-2xl font-bold tracking-tight text-base-content">Nouvel immeuble</h1>
      <p class="mt-1 text-sm text-muted">Ajoutez un nouvel immeuble au parc immobilier</p>
    </div>

    <BaseCard bodyClass="p-6 sm:p-8">
      <Form route="admin.buildings.store" #default="{ processing, errors }" class="space-y-5">
        <FormField id="name" label="Nom" :error="errors.name">
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Résidence des Alpes"
            class="input input-bordered w-full text-base-content"
            :class="{ 'input-error': errors.name }"
          />
        </FormField>

        <FormField id="address" label="Adresse" :error="errors.address">
          <input
            type="text"
            name="address"
            id="address"
            placeholder="Rue du Lac 12"
            class="input input-bordered w-full placeholder-muted"
            :class="{ 'input-error': errors.address }"
          />
        </FormField>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="city" label="Ville" :error="errors.city">
            <input
              type="text"
              name="city"
              id="city"
              placeholder="Lausanne"
              class="input input-bordered w-full placeholder-muted"
              :class="{ 'input-error': errors.city }"
            />
          </FormField>

          <FormField id="postalCode" label="NPA" :error="errors.postalCode">
            <input
              type="text"
              name="postalCode"
              id="postalCode"
              placeholder="1000"
              class="input input-bordered w-full placeholder-muted"
              :class="{ 'input-error': errors.postalCode }"
            />
          </FormField>
        </div>

        <div class="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
          <Link route="admin.buildings.index" class="btn btn-ghost">
            Annuler
          </Link>
          <button type="submit" :disabled="processing" class="btn btn-primary">
            Créer l'immeuble
          </button>
        </div>
      </Form>
    </BaseCard>
  </div>
</template>
