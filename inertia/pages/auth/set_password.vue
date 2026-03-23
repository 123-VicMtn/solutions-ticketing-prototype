<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { Form } from '@adonisjs/inertia/vue'

defineProps<{
  token: string
}>()
</script>

<template>
  <Head title="Definir le mot de passe" />

  <div class="flex min-h-[calc(100vh-12rem)] items-center justify-center">
    <div class="w-full max-w-sm">
      <div class="mb-8">
        <h1 class="text-2xl font-bold tracking-tight text-gray-900">Definir mon mot de passe</h1>
      </div>

      <Form route="set_password.store" :params="{ token }" class="space-y-5" #default="{ processing, errors }">
        <div>
          <label for="password" class="mb-1.5 block text-sm font-medium text-gray-700">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
            :class="{ 'border-red-500': errors.password }"
          />
          <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
        </div>

        <div>
          <label for="passwordConfirmation" class="mb-1.5 block text-sm font-medium text-gray-700">
            Confirmation
          </label>
          <input
            id="passwordConfirmation"
            name="passwordConfirmation"
            type="password"
            class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
            :class="{ 'border-red-500': errors.passwordConfirmation }"
          />
          <p v-if="errors.passwordConfirmation" class="mt-1 text-sm text-red-600">{{ errors.passwordConfirmation }}</p>
        </div>

        <button
          type="submit"
          :disabled="processing"
          class="w-full cursor-pointer rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Enregistrer
        </button>
      </Form>
    </div>
  </div>
</template>
