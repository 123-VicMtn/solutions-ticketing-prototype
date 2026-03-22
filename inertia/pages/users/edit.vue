<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { useForm } from '@inertiajs/vue3'

const props = defineProps<{
  user: {
    id: number
    firstName: string
    lastName: string
    email: string | null
  }
}>()

const form = useForm({
  firstName: props.user.firstName,
  lastName: props.user.lastName,
  email: props.user.email ?? '',
  password: '',
  passwordConfirmation: '',
})

function submit() {
  form.put(`/users/${props.user.id}`)
}
</script>

<template>
  <Head title="Modifier le profil" />

  <div class="mx-auto max-w-xl space-y-6 p-6">
    <h1 class="text-xl font-bold text-gray-900">Modifier le profil</h1>

    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700" for="firstName">Prenom</label>
        <input
          id="firstName"
          v-model="form.firstName"
          type="text"
          class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <p v-if="form.errors.firstName" class="mt-1 text-sm text-red-600">{{ form.errors.firstName }}</p>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700" for="lastName">Nom</label>
        <input
          id="lastName"
          v-model="form.lastName"
          type="text"
          class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <p v-if="form.errors.lastName" class="mt-1 text-sm text-red-600">{{ form.errors.lastName }}</p>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700" for="email">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <p v-if="form.errors.email" class="mt-1 text-sm text-red-600">{{ form.errors.email }}</p>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700" for="password">Nouveau mot de passe</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <p v-if="form.errors.password" class="mt-1 text-sm text-red-600">{{ form.errors.password }}</p>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700" for="passwordConfirmation">
          Confirmation
        </label>
        <input
          id="passwordConfirmation"
          v-model="form.passwordConfirmation"
          type="password"
          class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <p v-if="form.errors.passwordConfirmation" class="mt-1 text-sm text-red-600">
          {{ form.errors.passwordConfirmation }}
        </p>
      </div>

      <button
        type="submit"
        :disabled="form.processing"
        class="rounded-md bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        Enregistrer
      </button>
    </form>
  </div>
</template>
