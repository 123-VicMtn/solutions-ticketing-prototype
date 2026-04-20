<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import { computed, ref } from 'vue'
import { ticketPriorityBadgeClass } from '~/utils/ticketPriority'
import { TicketStatus } from '#models/ticket';
import type { Data } from '@generated/data'

const props = defineProps<{
  ticket: Data.Ticket
  comments: Data.TicketComment[]
  attachments: Data.TicketAttachment[]
  canSeeInternal: boolean
  canEditFields: boolean
  canChangeStatus: boolean
  allowedStatusTransitions: string[]
  canAssign: boolean
  providers: Data.Provider[]
  assignees: { id: number; fullName: string | null }[]
}>()

const workflowStatuses = ['ouvert', 'assigné', 'en cours', 'terminé', 'résolu', 'fermé'] as const satisfies readonly TicketStatus[]

const STATUS_LABELS: Record<string, string> = {
  ouvert: 'Ouvert',
  assigné: 'Assigné',
  'en cours': 'En cours',
  terminé: 'Terminé',
  résolu: 'Résolu',
  fermé: 'Fermé',
}

function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status
}

const statusValue = ref(props.ticket.status)
const comment = ref('')
const isInternal = ref(false)
const selectedProviderId = ref('')
const selectedAssigneeUserId = ref('')

function submitStatus(ticketId: number) {
  if (!statusValue.value) return
  router.put(`/tickets/${ticketId}/status`, { status: statusValue.value })
}

function submitAssign(ticketId: number) {
  if (!selectedAssigneeUserId.value) return

  router.post(`/tickets/${ticketId}/assign`, {
    assigneeUserId: selectedAssigneeUserId.value,
    providerId: selectedProviderId.value || undefined,
  })
}

function submitComment(ticketId: number) {
  if (!comment.value.trim()) return
  router.post(`/tickets/${ticketId}/comments`, {
    content: comment.value,
    isInternal: isInternal.value,
  })
}

const uploadingFiles = ref(false)

function submitAttachments(ticketId: number, event: Event) {
  const form = event.target as HTMLFormElement
  const data = new FormData(form)
  uploadingFiles.value = true
  router.post(`/tickets/${ticketId}/attachments`, data, {
    forceFormData: true,
    onFinish: () => {
      uploadingFiles.value = false
      form.reset()
    },
  })
}

const isSelectionChanged = computed(() => statusValue.value !== props.ticket.status)
const isAllowedStatus = (status: string) => props.allowedStatusTransitions.includes(status)
const isSubmitDisabled = computed(() => {
  if (!props.canChangeStatus) return true
  if (!isSelectionChanged.value) return true
  return !isAllowedStatus(statusValue.value)
})

const currentIndex = computed(() => {
  const idx = workflowStatuses.indexOf(props.ticket.status)
  return idx === -1 ? 0 : idx
})

function stepDotClass(status: string) {
  const isCurrent = status === props.ticket.status
  const isSelected = status === statusValue.value
  const isNextAllowed = isAllowedStatus(status) && !isCurrent

  if (isCurrent) return 'bg-gray-900 border-gray-900'
  if (isSelected) return 'bg-green-900 border-green-900'
  if (isNextAllowed) return 'bg-green-100 border-green-200'
  return 'bg-white border-gray-200'
}

function stepLabelClass(status: string) {
  if (status === props.ticket.status) return 'text-gray-900 font-semibold'
  if (status === statusValue.value) return 'text-green-900 font-semibold'
  if (isAllowedStatus(status)) return 'text-green-800 font-medium'
  return 'text-gray-500'
}

function resetStatusSelection() {
  statusValue.value = props.ticket.status
}
</script>

<template>
  <Head :title="ticket.reference ?? 'Ticket'" />
  <div class="space-y-8">
    <div>
      <Link href="/tickets" class="text-sm text-gray-500 hover:text-gray-900"
        >&larr; Retour aux tickets</Link
      >
      <div class="mt-2 flex items-start justify-between">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold tracking-tight text-gray-900">
              {{ ticket.reference }} - {{ ticket.title }}
            </h1>
            <span class="text-sm">
              <span class="badge badge-primary badge-outline">{{ ticket.status }}</span>
            </span>
          </div>
          <p class="mt-1 text-sm text-gray-500">
            {{ ticket.unit?.building?.name }} / {{ ticket.unit?.label }} - {{ ticket.category }} -
            <span :class="ticketPriorityBadgeClass(ticket.priority)">{{ ticket.priority }}</span>
          </p>
        </div>
        <Link
          v-if="canEditFields"
          :href="`/tickets/${ticket.id}/edit`"
          class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Modifier
        </Link>
      </div>
    </div>

    <div class="rounded-lg border border-gray-200 bg-white p-6">
      <div class="mb-3 text-xs uppercase tracking-wide text-gray-500">Description</div>
      <p class="whitespace-pre-wrap text-sm text-gray-800">{{ ticket.description }}</p>
    </div>

    <div class="grid w-full grid-flow-col grid-cols-3 gap-4">
      <div class="col-span-2 rounded-lg border border-gray-200 bg-white p-6">
        <div class="mb-3 text-xs uppercase tracking-wide text-gray-500">Demandeur</div>
        <p class="whitespace-pre-wrap text-sm text-gray-800">{{ ticket.user?.fullName }}</p>
        <p class="whitespace-pre-wrap text-sm text-gray-800">{{ ticket.user?.email }}</p>
        <p class="whitespace-pre-wrap text-sm text-gray-800">{{ ticket.user?.phone }}</p>
        <p class="whitespace-pre-wrap text-sm text-gray-800">
          {{ ticket.user?.notificationPreference }}
        </p>
      </div>

      <div class="rounded-lg border border-gray-200 bg-white p-6">
        <div class="mb-3 text-xs uppercase tracking-wide text-gray-500">Assignation</div>

        <template v-if="ticket.provider">
          <div class="text-xs uppercase tracking-wide text-gray-500">Prestataire</div>
          <p class="whitespace-pre-wrap text-sm text-gray-800">{{ ticket.provider.companyName }}</p>
          <p class="whitespace-pre-wrap text-sm text-gray-800">{{ ticket.provider.speciality }}</p>
          <p class="whitespace-pre-wrap text-sm text-gray-800">{{ ticket.provider.phone }}</p>
        </template>

        <template v-else-if="ticket.assignee">
          <div class="text-xs uppercase tracking-wide text-gray-500">Interne</div>
          <p class="whitespace-pre-wrap text-sm text-gray-800">
            {{ ticket.assignee.fullName ?? '—' }}
          </p>
        </template>

        <p v-else-if="!canAssign" class="text-sm text-gray-400 italic">Pas encore assigné</p>

        <form
          v-if="canAssign"
          class="mt-3 space-y-3"
          :class="{ 'border-t border-gray-100 pt-3': ticket.provider || ticket.assignee }"
          @submit.prevent="submitAssign(ticket.id)"
        >
          <div class="space-y-2">
            <div class="text-xs uppercase tracking-wide text-gray-500">Suivi interne (obligatoire)</div>
            <select
              v-model="selectedAssigneeUserId"
              class="block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            >
              <option value="">{{ ticket.assignee ? 'Réassigner…' : 'Sélectionner…' }}</option>
              <option v-for="a in assignees" :key="a.id" :value="a.id">
                {{ a.fullName ?? `#${a.id}` }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <div class="text-xs uppercase tracking-wide text-gray-500">Prestataire</div>
            <select
              v-model="selectedProviderId"
              class="block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            >
              <option value="">{{ ticket.provider ? 'Réassigner…' : 'Aucun prestataire' }}</option>
              <option v-for="provider in providers" :key="provider.id" :value="provider.id">
                {{ provider.companyName }} — {{ provider.speciality }}
              </option>
            </select>
          </div>

          <button
            type="submit"
            :disabled="!selectedAssigneeUserId"
            class="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            Enregistrer l’assignation
          </button>
        </form>
      </div>
    </div>

    <div v-if="canChangeStatus" class="rounded-lg border border-gray-200 bg-white p-6">
      <div class="mb-3 text-xs uppercase tracking-wide text-gray-500">Statut</div>

      <form class="space-y-4" @submit.prevent="submitStatus(ticket.id)">
        <div class="rounded-md bg-gray-50 p-4">
          <div class="mt-4 flex items-center gap-2">
            <template v-for="(status, idx) in workflowStatuses" :key="status">
              <button
                v-if="isAllowedStatus(status) || status === ticket.status"
                type="button"
                class="flex flex-col items-center"
                :class="status === ticket.status ? 'cursor-default' : 'cursor-pointer'"
                :disabled="status === ticket.status"
                @click="statusValue = status"
              >
                <span
                  v-if="status === ticket.status"
                  class="mb-1 flex items-center justify-center"
                >
                  <ChevronDownIcon class="h-4 w-4 text-gray-900" />
                </span>
                <span class="flex h-4 w-4 items-center justify-center rounded-full border" :class="stepDotClass(status)">
                  <span v-if="status === ticket.status" class="h-1.5 w-1.5 rounded-full bg-white"></span>
                </span>
                <span class="mt-1 text-[11px] text-center leading-tight" :class="stepLabelClass(status)">
                  {{ statusLabel(status) }}
                </span>
              </button>

              <div v-else class="flex flex-col items-center">
                <span class="flex h-4 w-4 items-center justify-center rounded-full border" :class="stepDotClass(status)">
                  <span class="h-1.5 w-1.5 rounded-full bg-transparent"></span>
                </span>
                <span class="mt-1 text-[11px] text-center leading-tight" :class="stepLabelClass(status)">
                  {{ statusLabel(status) }}
                </span>
              </div>

              <div
                v-if="idx < workflowStatuses.length - 1"
                class="h-0.5 flex-1"
                :class="idx < currentIndex ? 'bg-gray-900' : 'bg-gray-200'"
              ></div>
            </template>
          </div>

          <div v-if="allowedStatusTransitions.length" class="mt-5">
            <div class="mb-2 text-xs uppercase tracking-wide text-gray-500">
              Prochaines étapes possibles
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="nextStatus in allowedStatusTransitions"
                :key="nextStatus"
                type="button"
                class="rounded-md border px-3 py-1.5 text-sm font-medium transition-colors"
                :class="
                  statusValue === nextStatus
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-green-200 bg-white text-green-800 hover:bg-green-50'
                "
                @click="statusValue = nextStatus"
              >
                {{ statusLabel(nextStatus) }}
              </button>
            </div>
          </div>

          <p v-if="allowedStatusTransitions.length === 0" class="mt-3 text-sm italic text-gray-500">
            Aucune transition autorisée depuis {{ statusLabel(ticket.status) }}.
          </p>
        </div>

        <div class="flex items-center justify-between gap-3">
          <button
            type="submit"
            :disabled="isSubmitDisabled"
            class="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            Mettre à jour
          </button>

          <button
            v-if="isSelectionChanged"
            type="button"
            @click="resetStatusSelection"
            class="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>

    <div class="rounded-lg border border-gray-200 bg-white p-6">
      <div class="mb-3 text-xs uppercase tracking-wide text-gray-500">Commentaires</div>
      <div class="space-y-3">
        <div v-for="c in comments" :key="c.id" class="rounded-md bg-gray-50 p-3">
          <div class="mb-1 text-xs text-gray-500">
            {{ c.user?.fullName ?? c.user?.email }}
            <span
              v-if="c.isInternal"
              class="ml-2 rounded bg-amber-100 px-2 py-0.5 text-amber-800"
              >interne</span
            >
          </div>
          <p class="text-sm text-gray-800">{{ c.content }}</p>
        </div>
      </div>

      <form class="mt-4 space-y-3" @submit.prevent="submitComment(ticket.id)">
        <textarea
          v-model="comment"
          rows="3"
          class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="Ajouter un commentaire..."
        />
        <div class="flex items-center gap-3">
          <label
            v-if="canSeeInternal"
            class="inline-flex items-center gap-2 text-sm text-gray-700"
          >
            <input v-model="isInternal" type="checkbox" />
            Commentaire interne (visible gérance uniquement)
          </label>
          <button type="submit" class="rounded-md bg-gray-900 px-4 py-2 text-sm text-white">
            Publier
          </button>
        </div>
      </form>
    </div>

    <div class="rounded-lg border border-gray-200 bg-white p-6">
      <div class="mb-3 text-xs uppercase tracking-wide text-gray-500">Pièces jointes</div>

      <ul v-if="attachments.length" class="space-y-2">
        <li v-for="attachment in attachments" :key="attachment.id" class="text-sm text-gray-700">
          <a :href="attachment.filePath" target="_blank" class="text-gray-900 underline">{{
            attachment.originalName
          }}</a>
          <span class="ml-2 text-xs text-gray-500"
            >({{ Math.ceil(attachment.sizeBytes / 1024) }} KB)</span
          >
        </li>
      </ul>
      <p v-else class="text-sm italic text-gray-400">Aucune pièce jointe</p>

      <form
        class="mt-4 flex items-center gap-3"
        @submit.prevent="submitAttachments(ticket.id, $event)"
      >
        <input
          name="attachments"
          type="file"
          multiple
          accept="image/*,.pdf"
          class="block w-full text-sm text-gray-500 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
        />
        <button
          type="submit"
          :disabled="uploadingFiles"
          class="shrink-0 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Envoyer
        </button>
      </form>
    </div>
  </div>
</template>
