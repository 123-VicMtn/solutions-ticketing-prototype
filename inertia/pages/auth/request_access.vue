<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { Form, Link } from '@adonisjs/inertia/vue'
import BaseCard from '~/components/common/cards/BaseCard.vue'
import CenteredContent from '~/components/common/layouts/CenteredContent.vue'
import FormField from '~/components/common/forms/FormField.vue'
import BaseButton from '~/components/common/buttons/BaseButton.vue'
</script>

<template>
  <Head title="Demander un accès" />

  <CenteredContent maxWidthClass="max-w-xl">
    <div class="mb-8 flex justify-center">
      <div class="group inline-flex items-center gap-3">
        <div class="avatar">
          <div class="w-32 transition sm:w-20">
            <img src="/resources/assets/images/logo.png" alt="Logo" class="rounded" />
          </div>
        </div>
      </div>
    </div>

    <div class="mb-6">
      <h1 class="text-2xl font-bold tracking-tight text-base-content">Demande d'accès</h1>
      <p class="mt-1 text-sm text-muted">
        Envoyez votre demande, un gestionnaire la validera.
      </p>
    </div>

    <BaseCard bodyClass="p-6 sm:p-8">
      <Form route="request_access.store" #default="{ processing, errors }" class="space-y-5">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">

          <FormField id="lastName" label="Nom" :error="errors.lastName">
            <input
              id="lastName"
              name="lastName"
              type="text"
              autocomplete="family-name"
              class="input input-bordered w-full placeholder-muted"
              :class="{ 'input-error': errors.lastName }"
            />
          </FormField>

          <FormField id="firstName" label="Prénom" :error="errors.firstName">
            <input
              id="firstName"
              name="firstName"
              type="text"
              autocomplete="given-name"
              class="input input-bordered w-full placeholder-muted"
              :class="{ 'input-error': errors.firstName }"
            />
          </FormField>
        </div>

        <FormField id="email" label="Email" :error="errors.email">
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            class="input input-bordered w-full placeholder-muted"
            :class="{ 'input-error': errors.email }"
          />
        </FormField>

        <FormField id="phone" label="Téléphone" :error="errors.phone">
          <input
            id="phone"
            name="phone"
            type="text"
            autocomplete="tel"
            class="input input-bordered w-full placeholder-muted"
            :class="{ 'input-error': errors.phone }"
          />
        </FormField>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="role" label="Rôle" :error="errors.role">
            <select
              id="role"
              name="role"
              class="select select-bordered w-full"
              :class="{ 'select-error': errors.role }"
            >
              <option value="tenant">Locataire</option>
              <option value="owner">Propriétaire</option>
            </select>
          </FormField>

          <FormField
            id="notificationPreference"
            label="Préférence de notification"
            :error="errors.notificationPreference"
          >
            <select
              id="notificationPreference"
              name="notificationPreference"
              class="select select-bordered w-full"
              :class="{ 'select-error': errors.notificationPreference }"
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </FormField>
        </div>

        <BaseButton
          type="submit"
          :disabled="processing"
          label="Envoyer la demande"
          class="w-full"
        />

        <p class="text-center text-sm text-muted">
          Déjà un accès ?
          <Link route="session.create" class="font-medium text-base-content hover:underline">
            Se connecter
          </Link>
        </p>
      </Form>
    </BaseCard>
  </CenteredContent>
</template>
