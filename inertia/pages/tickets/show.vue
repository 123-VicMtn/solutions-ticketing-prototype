<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3'
import { ref } from 'vue'

const props = defineProps<{
  ticket: {
    id: number
    reference: string | null
    category: string
    priority: string
    status: string
    title: string
    description: string
    unit: { label: string; building: { name: string } }
    user: { fullName: string | null; email: string }
  }
  comments: Array<{
    id: number
    content: string
    isInternal: boolean
    createdAt: string
    user: { fullName: string | null; email: string }
  }>
  attachments: Array<{
    id: number
    originalName: string
    mimeType: string
    sizeBytes: number
    filePath: string
  }>
  isAdmin: boolean
}>()

const statusValue = ref(props.ticket.status)
const comment = ref('')
const isInternal = ref(false)

function submitStatus(ticketId: number) {
  if (!statusValue.value) return
  router.put(`/admin/tickets/${ticketId}/status`, { status: statusValue.value })
}

function submitComment(ticketId: number) {
  if (!comment.value.trim()) return
  router.post(`/tickets/${ticketId}/comments`, {
    content: comment.value,
    isInternal: isInternal.value,
  })
}
</script>

<template>
  <Head :title="ticket.reference ?? 'Ticket'" />
  <div class="space-y-8">
    <div>
      <Link href="/tickets" class="text-sm text-gray-500 hover:text-gray-900">&larr; Retour aux tickets</Link>
      <h1 class="mt-2 text-2xl font-bold tracking-tight text-gray-900">
        {{ ticket.reference }} - {{ ticket.title }}
      </h1>
      <p class="mt-1 text-sm text-gray-500">
        {{ ticket.unit.building.name }} / {{ ticket.unit.label }} - {{ ticket.category }} - {{ ticket.priority }}
      </p>
    </div>

    <div class="rounded-lg border border-gray-200 bg-white p-6">
      <div class="mb-3 text-xs uppercase tracking-wide text-gray-500">Description</div>
      <p class="whitespace-pre-wrap text-sm text-gray-800">{{ ticket.description }}</p>
    </div>

    <div v-if="isAdmin" class="rounded-lg border border-gray-200 bg-white p-6">
      <div class="mb-3 text-xs uppercase tracking-wide text-gray-500">Statut</div>
      <form class="flex items-center gap-3" @submit.prevent="submitStatus(ticket.id)">
        <select v-model="statusValue" name="status" class="rounded-md border border-gray-300 px-3 py-2 text-sm">
          <option value="">Choisir</option>
          <option value="open">open</option>
          <option value="assigned">assigned</option>
          <option value="in_progress">in_progress</option>
          <option value="resolved">resolved</option>
          <option value="closed">closed</option>
        </select>
        <button type="submit" class="rounded-md bg-gray-900 px-4 py-2 text-sm text-white">Mettre à jour</button>
      </form>
    </div>

    <div class="rounded-lg border border-gray-200 bg-white p-6">
      <div class="mb-3 text-xs uppercase tracking-wide text-gray-500">Commentaires</div>
      <div class="space-y-3">
        <div v-for="comment in comments" :key="comment.id" class="rounded-md bg-gray-50 p-3">
          <div class="mb-1 text-xs text-gray-500">
            {{ comment.user.fullName ?? comment.user.email }}
            <span v-if="comment.isInternal" class="ml-2 rounded bg-amber-100 px-2 py-0.5 text-amber-800">interne</span>
          </div>
          <p class="text-sm text-gray-800">{{ comment.content }}</p>
        </div>
      </div>

      <form class="mt-4 space-y-3" @submit.prevent="submitComment(ticket.id)">
        <textarea v-model="comment" rows="3" class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Ajouter un commentaire..." />
        <label v-if="isAdmin" class="inline-flex items-center gap-2 text-sm text-gray-700">
          <input v-model="isInternal" type="checkbox" />
          Commentaire interne (visible gérance uniquement)
        </label>
        <button type="submit" class="rounded-md bg-gray-900 px-4 py-2 text-sm text-white">Publier</button>
      </form>
    </div>

    <div class="rounded-lg border border-gray-200 bg-white p-6">
      <div class="mb-3 text-xs uppercase tracking-wide text-gray-500">Pièces jointes</div>
      <ul class="space-y-2">
        <li v-for="attachment in attachments" :key="attachment.id" class="text-sm text-gray-700">
          <a :href="attachment.filePath" target="_blank" class="text-gray-900 underline">{{ attachment.originalName }}</a>
          <span class="ml-2 text-xs text-gray-500">({{ Math.ceil(attachment.sizeBytes / 1024) }} KB)</span>
        </li>
      </ul>
    </div>
  </div>
</template>
