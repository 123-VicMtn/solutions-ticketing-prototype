<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { Form, Link } from '@adonisjs/inertia/vue'
</script>

<template>
  <Head title="Connexion" />

  <div class="flex min-h-[calc(100vh-12rem)] items-center justify-center">
    <div class="w-full max-w-sm">
      <div class="mb-8">
        <h1 class="text-2xl font-bold tracking-tight text-gray-900">Connexion</h1>
        <p class="mt-1 text-sm text-gray-500">
          Entrez vos identifiants pour accéder à votre espace
        </p>
      </div>

      <Form route="session.store" #default="{ processing, errors }" class="space-y-5">
        <div>
          <label for="email" class="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            autocomplete="username"
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
            autocomplete="current-password"
            class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
            :class="{ 'border-red-500': errors.password }"
          />
          <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
        </div>

        <button
          type="submit"
          :disabled="processing"
          class="w-full cursor-pointer rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Se connecter
        </button>

        <p class="text-center text-sm text-gray-500">
          Pas encore de compte ?
          <Link route="request_access.create" class="font-medium text-gray-900 hover:underline">
            Demander votre accès
          </Link>
        </p>
      </Form>
    </div>
  </div>
</template>
