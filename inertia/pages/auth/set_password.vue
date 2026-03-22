<script setup lang="ts">
import { Head, router } from '@inertiajs/vue3'
import { ref } from 'vue'

const props = defineProps<{
  token: string
}>()

const password = ref('')
const passwordConfirmation = ref('')
const error = ref('')
const loading = ref(false)

function submit() {
  error.value = ''
  loading.value = true

  router.post(
    `/set-password/${props.token}`,
    {
      password: password.value,
      passwordConfirmation: passwordConfirmation.value,
    },
    {
      onError: () => {
        error.value = 'Impossible de definir le mot de passe'
      },
      onFinish: () => {
        loading.value = false
      },
    }
  )
}
</script>

<template>
  <Head title="Definir le mot de passe" />

  <div class="flex min-h-[calc(100vh-12rem)] items-center justify-center">
    <div class="w-full max-w-sm">
      <div class="mb-8">
        <h1 class="text-2xl font-bold tracking-tight text-gray-900">Definir mon mot de passe</h1>
      </div>

      <form class="space-y-5" @submit.prevent="submit">
        <div>
          <label for="password" class="mb-1.5 block text-sm font-medium text-gray-700">
            Mot de passe
          </label>
          <input
            id="password"
            v-model="password"
            name="password"
            type="password"
            class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label for="passwordConfirmation" class="mb-1.5 block text-sm font-medium text-gray-700">
            Confirmation
          </label>
          <input
            id="passwordConfirmation"
            v-model="passwordConfirmation"
            name="passwordConfirmation"
            type="password"
            class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Enregistrer
        </button>
      </form>
    </div>
  </div>
</template>
