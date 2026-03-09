<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { Form, Link } from '@adonisjs/inertia/vue'
</script>

<template>
  <Head title="Créer un compte" />

  <div class="flex min-h-[calc(100vh-12rem)] items-center justify-center">
    <div class="w-full max-w-sm">
      <div class="mb-8">
        <h1 class="text-2xl font-bold tracking-tight text-gray-900">Créer un compte</h1>
        <p class="mt-1 text-sm text-gray-500">
          Remplissez le formulaire pour accéder à la plateforme
        </p>
      </div>

      <Form route="new_account.store" #default="{ processing, errors }" class="space-y-5">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="firstName" class="mb-1.5 block text-sm font-medium text-gray-700">
              Prénom
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
              :class="{ 'border-red-500': errors.firstName }"
            />
            <p v-if="errors.firstName" class="mt-1 text-sm text-red-600">{{ errors.firstName }}</p>
          </div>
          <div>
            <label for="lastName" class="mb-1.5 block text-sm font-medium text-gray-700">
              Nom
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
              :class="{ 'border-red-500': errors.lastName }"
            />
            <p v-if="errors.lastName" class="mt-1 text-sm text-red-600">{{ errors.lastName }}</p>
          </div>
        </div>

        <div>
          <label for="email" class="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            autocomplete="email"
            class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
            :class="{ 'border-red-500': errors.email }"
          />
          <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
        </div>

        <div>
          <label for="password" class="mb-1.5 block text-sm font-medium text-gray-700">
            Mot de passe
          </label>
          <input
            type="password"
            name="password"
            id="password"
            autocomplete="new-password"
            class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
            :class="{ 'border-red-500': errors.password }"
          />
          <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
        </div>

        <div>
          <label for="passwordConfirmation" class="mb-1.5 block text-sm font-medium text-gray-700">
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            name="passwordConfirmation"
            id="passwordConfirmation"
            autocomplete="new-password"
            class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
            :class="{ 'border-red-500': errors.passwordConfirmation }"
          />
          <p v-if="errors.passwordConfirmation" class="mt-1 text-sm text-red-600">
            {{ errors.passwordConfirmation }}
          </p>
        </div>

        <button
          type="submit"
          :disabled="processing"
          class="w-full cursor-pointer rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Créer mon compte
        </button>

        <p class="text-center text-sm text-gray-500">
          Déjà un compte ?
          <Link route="session.create" class="font-medium text-gray-900 hover:underline">
            Se connecter
          </Link>
        </p>
      </Form>
    </div>
  </div>
</template>
