<script setup lang="ts">
import { reactive } from 'vue'
import { Form } from '@adonisjs/inertia/vue'

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  notificationPreference: 'email',
})

const notificationPreferences = [
  { label: 'Email', value: 'email' },
  { label: 'SMS', value: 'sms' },
]

function validatePreferences(preference: string) {
    if (form.notificationPreference === 'email' && form.email === '') {
        return false
    }
    if (form.notificationPreference === 'sms' && form.phone === '') {
        return false
    }
    return true
    }
</script>

<template>
    <div class="flex justify-center text-xl font-bold pb-6">
        <p>Remplissez le formulaire pour envoyer votre demande</p>
    </div>
  <div class="max-w-xl mx-auto shadow shadow-gray-400 rounded p-8">
    <h1 class="text-lg font-bold mb-6">Mes informations</h1>
    <Form route="admin.users.store" method="post" :defaults="form" class="space-y-4">
      <div>
        <label class="block text-sm font-semibold mb-1" for="firstName">Prénom</label>
        <input
          id="firstName"
          v-model="form.firstName"
          type="text"
          class="input w-full border border-gray-300 rounded"
          required
        />
      </div>
      <div>
        <label class="block text-sm font-semibold mb-1" for="lastName">Nom</label>
        <input
          id="lastName"
          v-model="form.lastName"
          type="text"
          class="input w-full border border-gray-300 rounded"
          required
        />
      </div>
      <div>
        <label class="block text-sm font-semibold mb-1" for="email">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="input w-full border border-gray-300 rounded"
          required
        />
      </div>
      <div>
        <label class="block text-sm font-semibold mb-1" for="phone">Téléphone</label>
        <input
          id="phone"
          v-model="form.phone"
          type="tel"
          class="input w-full border border-gray-300 rounded"
        />
      </div>
      <div>
        <label class="block text-sm font-semibold mb-1" for="password">Mot de passe</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          class="input w-full border border-gray-300 rounded"
          required
        />
      </div>
      <div>
        <label class="block text-sm font-semibold mb-1" for="notificationPreference">
          Préférence de notification
        </label>
        <select
          id="notificationPreference"
          v-model="form.notificationPreference"
          class="input w-full border border-gray-300 rounded"
        >
          <option
            v-for="pref in notificationPreferences"
            :key="pref.value"
            :value="pref.value"
          >
            {{ pref.label }}
          </option>
        </select>
      </div>
        <p class="py-2 text-sm text-gray-500">
          Vous recevrez une notification par email ou par SMS lorsque votre demande sera traitée.
        </p>
      <div class="flex pt-4 justify-center">
        <button type="submit" class="btn btn-primary border border-gray-300 rounded px-4 py-2">
          Envoyer ma demande
        </button>
      </div>
    </Form>
  </div>
</template>