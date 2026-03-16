<script setup lang="ts">
import { computed } from 'vue'
import { Link, useForm } from '@inertiajs/vue3'

const notificationPreferences = [
  { label: 'Email', value: 'email' },
  { label: 'SMS', value: 'sms' },
]

const form = useForm({
  firstName: '',
  lastName: '',
  unitsName: '',
  npa: '',
  email: '',
  phone: '',
  password: '',
  notificationPreference: 'email',
})

const canSubmit = computed(() => {
  if (form.notificationPreference === 'email') return form.email !== ''
  if (form.notificationPreference === 'sms') return form.phone !== ''
  return true
})

function submitUser() {
  form.post('/users')
}
</script>

<template>
  <div class="flex justify-center text-xl font-bold pb-6">
    <p>Remplissez le formulaire pour envoyer votre demande</p>
  </div>
  <div class="max-w-xl mx-auto shadow shadow-gray-400 rounded p-8">
    <h1 class="text-lg font-bold mb-6">Mes informations</h1>
    <form @submit.prevent="submitUser" class="space-y-4">
      <div>
        <label class="block text-sm font-semibold mb-1" for="firstName"
          >Prénom<span class="text-red-500">*</span></label
        >
        <input
          id="firstName"
          v-model="form.firstName"
          type="text"
          class="input w-full border border-gray-300 rounded"
          required
        />
        <span v-if="form.errors.firstName" class="text-red-500 text-sm">{{
          form.errors.firstName
        }}</span>
      </div>

      <div>
        <label class="block text-sm font-semibold mb-1" for="lastName"
          >Nom<span class="text-red-500">*</span></label
        >
        <input
          id="lastName"
          v-model="form.lastName"
          type="text"
          class="input w-full border border-gray-300 rounded"
          required
        />
        <span v-if="form.errors.lastName" class="text-red-500 text-sm">{{
          form.errors.lastName
        }}</span>
      </div>

      <div>
        <label class="block text-sm font-semibold mb-1" for="password">Logement</label>
        <p class="text-xs text-gray-500">Voir nomination sur contrat de bail</p>
        <input
          id="unitsName"
          v-model="form.unitsName"
          type="password"
          class="input w-full border border-gray-300 rounded"
          required
        />
        <span v-if="form.errors.password" class="text-red-500 text-sm">{{
          form.errors.password
        }}</span>
      </div>

      <div>
        <label class="block text-sm font-semibold mb-1" for="NPA">NPA/Localité</label>
        <input
          id="npa"
          v-model="form.npa"
          type="text"
          class="input w-full border border-gray-300 rounded"
          required
        />
        <span v-if="form.errors.password" class="text-red-500 text-sm">{{
          form.errors.password
        }}</span>
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
        <span v-if="form.errors.password" class="text-red-500 text-sm">{{
          form.errors.password
        }}</span>
      </div>

      <div class="bg outline-2 outline-gray-300 rounded p-4">
        <h2 class="text-sm font-semibold mb-2">Choisir un moyen de notification au minimum</h2>
        <div>
          <label class="block text-sm font-semibold mb-1" for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="input w-full border border-gray-300 rounded"
          />
          <span v-if="form.errors.email" class="text-red-500 text-sm">{{ form.errors.email }}</span>
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1" for="phone">Téléphone</label>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            class="input w-full border border-gray-300 rounded"
          />
          <span v-if="form.errors.phone" class="text-red-500 text-sm">{{ form.errors.phone }}</span>
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
            <option v-for="pref in notificationPreferences" :key="pref.value" :value="pref.value">
              {{ pref.label }}
            </option>
          </select>
        </div>
      </div>

      <p class="py-2 text-sm text-gray-500">
        Vous recevrez une notification par email ou par SMS lorsque votre demande sera traitée.
      </p>

      <div class="flex pt-4 justify-center">
        <button
          type="submit"
          :disabled="form.processing || !canSubmit"
          class="btn btn-primary border border-gray-300 rounded px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {{
            form.processing
              ? 'Envoi en cours...'
              : canSubmit
                ? 'Envoyer ma demande'
                : 'Veuillez remplir tous les champs requis'
          }}
        </button>
      </div>
    </form>
  </div>
</template>
