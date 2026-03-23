<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3'
import { computed, ref } from 'vue'
const props = defineProps<{
  units: Array<{
    id: number
    label: string
    type: string
    building: { id: number; name: string }
  }>
}>()

const errors = ref<Record<string, string>>({})
const processing = ref(false)

const canAccessPriority = computed(() => {
  const role = (props as any)?.user?.role
  return role === 'admin' || role === 'manager'
})

async function submitTicket(event: Event) {
  const form = event.target as HTMLFormElement
  const data = new FormData(form)
  processing.value = true
  errors.value = {}

  router.post('/tickets', data, {
    forceFormData: true,
    onError: (e) => {
      errors.value = e as Record<string, string>
    },
    onFinish: () => {
      processing.value = false
    },
  })
}
</script>

<template>
  <Head title="Nouveau ticket" />
  <div class="mx-auto max-w-2xl">
    <div class="mb-6">
      <Link href="/tickets" class="text-sm text-gray-500 hover:text-gray-900"
        >&larr; Retour aux tickets</Link
      >
    </div>

    <h1 class="text-2xl font-bold tracking-tight text-gray-900">Nouveau ticket</h1>
    <p class="mt-1 text-sm text-gray-500">Décrivez votre demande d'intervention</p>

    <form class="mt-8 space-y-5" @submit.prevent="submitTicket">
      <div>
        <label for="unitId" class="mb-1.5 block text-sm font-medium text-gray-700"
          >Lot concerné</label
        >
        <select
          name="unitId"
          id="unitId"
          class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Sélectionner un lot</option>
          <option v-for="unit in units" :key="unit.id" :value="unit.id">
            {{ unit.building.name }} - {{ unit.label }} ({{ unit.type }})
          </option>
        </select>
        <p v-if="errors.unitId" class="mt-1 text-sm text-red-600">{{ errors.unitId }}</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="category" class="mb-1.5 block text-sm font-medium text-gray-700"
            >Catégorie</label
          >
          <select
            name="category"
            id="category"
            class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="Technique & Maintenance">Technique & Maintenance</option>
            <option value="Entretien & Nettoyage">Entretien & Nettoyage</option>
            <option value="Administratifs & Contrats">Administratifs & Contrats</option>
            <option value="Finance & Facturation">Finance & Facturation</option>
            <option value="Relations & Conflits">Relations & Conflits</option>
            <option value="Gestion des accès">Gestion des accès</option>
            <option value="Déménagement">Déménagement</option>
            <option value="Urgences">Urgences</option>
          </select>
        </div>
        <div v-if="canAccessPriority">
          <label for="priority" class="mb-1.5 block text-sm font-medium text-gray-700"
            >Priorité</label
          >
          <select
            name="priority"
            id="priority"
            class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="basse">Basse</option>
            <option value="moyenne">Moyenne</option>
            <option value="élevée">Élevée</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>
      </div>

      <div>
        <label for="title" class="mb-1.5 block text-sm font-medium text-gray-700">Titre</label>
        <input
          name="title"
          id="title"
          type="text"
          class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <p v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title }}</p>
      </div>

      <div>
        <label for="description" class="mb-1.5 block text-sm font-medium text-gray-700"
          >Description</label
        >
        <textarea
          name="description"
          id="description"
          rows="5"
          class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
      </div>

      <div>
        <label for="attachments" class="mb-1.5 block text-sm font-medium text-gray-700"
          >Photos (optionnel)</label
        >
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500">Formats acceptés: JPG, PNG, GIF</span>
          <span class="text-xs text-gray-500">Taille maximale: 10MB</span>
        </div>
        <div class="relative flex justify-center items-center w-full">
          <input
            name="attachments"
            id="attachments"
            type="file"
            multiple
            accept="image/*"
            class="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
          />
          <div
            class="flex flex-col justify-center items-center w-full border border-gray-300 rounded py-12 px-3 bg-white text-gray-500 pointer-events-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 mb-2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              src="resources/assets/svg/photo.svg"
            ></svg>
            <span class="text-sm">Cliquez pour ajouter des photos</span>
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="processing"
          class="cursor-pointer rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Créer le ticket
        </button>
      </div>
    </form>
  </div>
</template>
