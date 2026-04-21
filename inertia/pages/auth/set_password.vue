<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { Form } from '@adonisjs/inertia/vue'
import BaseCard from '~/components/common/cards/BaseCard.vue'
import CenteredContent from '~/components/common/layouts/CenteredContent.vue'
import FormField from '~/components/common/forms/FormField.vue'
import BaseButton from '~/components/common/buttons/BaseButton.vue'

defineProps<{
  token: string
}>()
</script>

<template>
  <Head title="Définir le mot de passe" />

  <CenteredContent maxWidthClass="max-w-sm">
    <div class="mb-6">
      <h1 class="text-2xl font-bold tracking-tight text-base-content">Définir mon mot de passe</h1>
      <p class="mt-1 text-sm text-muted">Choisissez un mot de passe pour activer votre accès</p>
    </div>

    <BaseCard bodyClass="p-6 sm:p-8">
      <Form route="set_password.store" :params="{ token }" class="space-y-5" #default="{ processing, errors }">
        <FormField id="password" label="Mot de passe" :error="errors.password">
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="new-password"
            class="input input-bordered w-full placeholder-muted"
            :class="{ 'input-error': errors.password }"
          />
        </FormField>

        <FormField
          id="passwordConfirmation"
          label="Confirmation"
          :error="errors.passwordConfirmation"
        >
          <input
            id="passwordConfirmation"
            name="passwordConfirmation"
            type="password"
            autocomplete="new-password"
            class="input input-bordered w-full placeholder-muted"
            :class="{ 'input-error': errors.passwordConfirmation }"
          />
        </FormField>

        <BaseButton
          type="submit"
          :disabled="processing"
          label="Enregistrer"
          class="w-full"
        />
      </Form>
    </BaseCard>
  </CenteredContent>
</template>
