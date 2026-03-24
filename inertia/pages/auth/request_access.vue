<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
import { Form } from '@adonisjs/inertia/vue'
</script>

<template>
  <Head title="Demander un acces" />

  <div class="flex min-h-[calc(100vh-12rem)] items-center justify-center">
    <div class="w-full max-w-xl">
      <div class="mb-8">
        <h1 class="text-2xl font-bold tracking-tight text-gray-900">Demande d'acces</h1>
        <p class="mt-1 text-sm text-gray-500">
          Envoyez votre demande, un gestionnaire la validera.
        </p>
      </div>

      <Form route="request_access.store" #default="{ processing, errors }" class="space-y-5">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="firstName" class="mb-1.5 block text-sm font-medium text-gray-700">Prenom</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              :class="{ 'border-red-500': errors.firstName }"
            />
            <p v-if="errors.firstName" class="mt-1 text-sm text-red-600">{{ errors.firstName }}</p>
          </div>
          <div>
            <label for="lastName" class="mb-1.5 block text-sm font-medium text-gray-700">Nom</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              :class="{ 'border-red-500': errors.lastName }"
            />
            <p v-if="errors.lastName" class="mt-1 text-sm text-red-600">{{ errors.lastName }}</p>
          </div>
        </div>

        <div>
          <label for="email" class="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            :class="{ 'border-red-500': errors.email }"
          />
          <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
        </div>

        <div>
          <label for="phone" class="mb-1.5 block text-sm font-medium text-gray-700">Telephone</label>
          <input
            id="phone"
            name="phone"
            type="text"
            class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            :class="{ 'border-red-500': errors.phone }"
          />
          <p v-if="errors.phone" class="mt-1 text-sm text-red-600">{{ errors.phone }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="role" class="mb-1.5 block text-sm font-medium text-gray-700">Role</label>
            <select
              id="role"
              name="role"
              class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              :class="{ 'border-red-500': errors.role }"
            >
              <option value="tenant">Locataire</option>
              <option value="owner">Proprietaire</option>
            </select>
            <p v-if="errors.role" class="mt-1 text-sm text-red-600">{{ errors.role }}</p>
          </div>
          <div>
            <label for="notificationPreference" class="mb-1.5 block text-sm font-medium text-gray-700">
              Notification
            </label>
            <select
              id="notificationPreference"
              name="notificationPreference"
              class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              :class="{ 'border-red-500': errors.notificationPreference }"
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
            <p v-if="errors.notificationPreference" class="mt-1 text-sm text-red-600">
              {{ errors.notificationPreference }}
            </p>
          </div>
        </div>

        <button
          type="submit"
          :disabled="processing"
          class="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Envoyer la demande
        </button>

        <p class="text-center text-sm text-gray-500">
          Deja un compte ?
          <Link route="session.create" class="font-medium text-gray-900 hover:underline">
            Se connecter
          </Link>
        </p>
      </Form>
    </div>
  </div>
</template>
