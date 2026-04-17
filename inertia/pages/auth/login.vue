<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { Form, Link } from '@adonisjs/inertia/vue'
import BaseCard from '~/components/common/cards/BaseCard.vue'
import CenteredContent from '~/components/common/layouts/CenteredContent.vue'
import FormField from '~/components/common/forms/FormField.vue'
import BaseButton from '~/components/common/buttons/BaseButton.vue'
</script>

<template>
  <Head title="Connexion" />

  <CenteredContent maxWidthClass="max-w-sm">
    <div class="mb-6">
      <h1 class="text-2xl font-bold tracking-tight text-base-content">Connexion</h1>
      <p class="mt-1 text-sm text-muted">Entrez vos identifiants pour accéder à votre espace</p>
    </div>

    <BaseCard bodyClass="p-6 sm:p-8">
      <Form route="session.store" #default="{ processing, errors }" class="space-y-5">
        <FormField id="email" label="Email" :error="errors.email">
          <input
            type="email"
            name="email"
            id="email"
            autocomplete="username"
            class="input input-bordered w-full placeholder-muted"
            :class="{ 'input-error': errors.email }"
          />
        </FormField>

        <FormField id="password" label="Mot de passe" :error="errors.password">
          <input
            type="password"
            name="password"
            id="password"
            autocomplete="current-password"
            class="input input-bordered w-full placeholder-muted"
            :class="{ 'input-error': errors.password }"
          />
        </FormField>

        <BaseButton
          type="submit"
          :disabled="processing"
          label="Se connecter"
          class="w-full"
        />

        <p class="text-center text-sm text-muted">
          Pas encore de compte ?
          <Link route="request_access.create" class="font-medium text-base-content hover:underline">
            Demander votre accès
          </Link>
        </p>
      </Form>
    </BaseCard>
  </CenteredContent>
</template>
