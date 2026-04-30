<script setup lang="ts">
import { Head, router } from '@inertiajs/vue3'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import { computed, ref } from 'vue'
import { ticketPriorityBadgeClass } from '~/utils/ticketPriority'
import { TicketStatus } from '#models/ticket';
import type { Data } from '@generated/data'
import { isTicketStatus } from '~/utils/ticketStatus'
import BaseCard from '~/components/common/cards/BaseCard.vue'
import BaseButton from '~/components/common/buttons/BaseButton.vue'
import FormField from '~/components/common/forms/FormField.vue'

type UnitWithBuilding = Data.Unit & { building?: { name?: string | null } | null }

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

const workflowStatuses = ['ouvert', 'assigné', 'en cours', 'terminé', 'résolu', 'facturé', 'fermé'] as const satisfies readonly TicketStatus[]

const STATUS_LABELS: Record<string, string> = {
  ouvert: 'Ouvert',
  assigné: 'Assigné',
  'en cours': 'En cours',
  terminé: 'Terminé',
  résolu: 'Résolu',
  facturé: 'Facturé',
  fermé: 'Fermé',
}

function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status
}

const statusValue = ref<TicketStatus>(props.ticket.status as TicketStatus)
const comment = ref('')
const isInternal = ref(false)
const selectedProviderId = ref<number | null>(props.ticket.provider?.id ?? null)
const selectedAssigneeUserId = ref<number | null>(props.ticket.assignee?.id ?? null)

const canSubmitAssign = computed(() => {
  return Boolean(selectedAssigneeUserId.value)
})

function submitStatus(ticketId: number) {
  if (!statusValue.value) return
  router.put(`/tickets/${ticketId}/status`, { status: statusValue.value })
}

function submitAssign(ticketId: number) {
  if (!selectedAssigneeUserId.value) return

  router.post(`/tickets/${ticketId}/assign`, {
    assigneeUserId: selectedAssigneeUserId.value,
    providerId: selectedProviderId.value ?? undefined,
  })
}

function submitComment(ticketId: number) {
  if (!comment.value.trim()) return
  router.post(
    `/tickets/${ticketId}/comments`,
    {
      content: comment.value,
      isInternal: isInternal.value,
    },
    {
      preserveScroll: true,
      onSuccess: () => {
        comment.value = ''
        isInternal.value = false
      },
    }
  )
}

const uploadingFiles = ref(false)
const attachmentErrors = ref<Record<string, string>>({})

function submitAttachments(ticketId: number, event: Event) {
  const form = event.target as HTMLFormElement
  const data = new FormData(form)
  attachmentErrors.value = {}
  uploadingFiles.value = true
  router.post(`/tickets/${ticketId}/attachments`, data, {
    forceFormData: true,
    onError: (errors) => {
      attachmentErrors.value = errors as Record<string, string>
    },
    onFinish: () => {
      uploadingFiles.value = false
    },
    onSuccess: () => {
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

  if (isCurrent) return 'bg-primary border-primary'
  if (isSelected) return 'bg-success border-success'
  if (isNextAllowed) return 'bg-success/10 border-success/20'
  return 'bg-base-100 border-base-300'
}

function stepLabelClass(status: string) {
  if (status === props.ticket.status) return 'text-base-content font-semibold'
  if (status === statusValue.value) return 'text-success font-semibold'
  if (isAllowedStatus(status)) return 'text-success font-medium'
  return 'text-muted'
}

function resetStatusSelection() {
  statusValue.value = props.ticket.status
}

const createdAtLabel = computed(() => {
  const value = props.ticket.createdAt
  if (!value) return '—'
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('fr-CH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const unitBuildingName = computed(() => {
  const unit = props.ticket.unit as UnitWithBuilding | null | undefined
  return unit?.building?.name ?? '—'
})
</script>

<template>
  <Head :title="ticket.reference ?? 'Ticket'" />
  <div class="space-y-8">
    <div>
      <BaseButton
        route="tickets.index"
        label="Retour aux tickets"
        variant="ghost"
        class="btn-sm -ml-2"
      />
      <div class="mt-2 flex items-start justify-between">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold tracking-tight text-base-content">
              {{ ticket.reference }} - {{ ticket.title }}
            </h1>
            <span class="text-sm">
              <span class="badge badge-primary badge-outline">{{ ticket.status }}</span>
            </span>
          </div>
          <p class="mt-1 text-sm text-muted">
            {{ unitBuildingName }} / {{ ticket.unit?.label }} - {{ ticket.category }} -
            <span :class="ticketPriorityBadgeClass(ticket.priority)">{{ ticket.priority }}</span>
          </p>
          <div class="mt-2">
            <span class="inline-flex items-center gap-2 rounded-md bg-base-200/60 px-2.5 py-1 text-sm text-base-content">
              <span class="text-xs uppercase tracking-wide text-muted">Créé le</span>
              <span class="font-semibold">{{ createdAtLabel }}</span>
            </span>
          </div>
        </div>
        <BaseButton
          v-if="canEditFields"
          route="tickets.edit"
          :params="{ id: ticket.id }"
          label="Modifier"
          variant="outline"
        />
      </div>
    </div>

    <BaseCard title="Description">
      <p class="whitespace-pre-wrap text-sm text-base-content">{{ ticket.description }}</p>
    </BaseCard>

    <div class="grid w-full grid-cols-1 gap-4 lg:grid-cols-12">
      <BaseCard title="Demandeur" bodyClass="p-6" class="lg:col-span-4">
        <div class="space-y-4">
          <div>
            <div class="text-xs uppercase tracking-wide text-secondary">Identité</div>
            <p class="mt-1 text-sm font-medium text-base-content">
              {{ ticket.user?.fullName ?? '—' }}
            </p>
          </div>

          <div class="grid gap-3">
            <div>
              <div class="text-xs uppercase tracking-wide text-secondary">Email</div>
              <a
                v-if="ticket.user?.email"
                class="mt-1 block text-sm font-medium link link-hover"
                :href="`mailto:${ticket.user.email}`"
              >
                {{ ticket.user.email }}
              </a>
              <p v-else class="mt-1 text-sm text-muted">—</p>
            </div>

            <div>
              <div class="text-xs uppercase tracking-wide text-secondary">Téléphone</div>
              <a
                v-if="ticket.user?.phone"
                class="mt-1 block text-sm font-medium link link-hover"
                :href="`tel:${ticket.user.phone}`"
              >
                {{ ticket.user.phone }}
              </a>
              <p v-else class="mt-1 text-sm text-muted">—</p>
            </div>
          </div>

          <div>
            <div class="text-xs uppercase tracking-wide text-secondary">Notifications</div>
            <p class="mt-1 text-sm text-base-content">
              {{ ticket.user?.notificationPreference ?? '—' }}
            </p>
          </div>
        </div>
      </BaseCard>

      <BaseCard title="Assignation" bodyClass="p-6" class="lg:col-span-8">
        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div class="rounded-md border border-base-200 bg-base-200/30 p-4">
              <div class="text-xs uppercase tracking-wide text-secondary">Suivi interne</div>
              <p class="mt-1 text-sm font-medium text-base-content">
                {{ ticket.assignee?.fullName ?? '—' }}
              </p>
            </div>

            <div class="rounded-md border border-base-200 bg-base-200/30 p-4">
              <div class="text-xs uppercase tracking-wide text-secondary">Prestataire</div>
              <p class="mt-1 text-sm font-medium text-base-content">
                {{ ticket.provider?.companyName ?? '—' }}
              </p>
              <p v-if="ticket.provider?.speciality" class="mt-0.5 text-sm text-muted">
                {{ ticket.provider.speciality }}
              </p>
              <p v-if="ticket.provider?.phone" class="mt-2 text-sm">
                <a class="link link-hover" :href="`tel:${ticket.provider.phone}`">
                  {{ ticket.provider.phone }}
                </a>
              </p>
            </div>
          </div>

          <p v-if="!ticket.provider && !ticket.assignee && !canAssign" class="text-sm text-muted italic">
            Pas encore assigné
          </p>

          <form
            v-if="canAssign"
            class="space-y-3"
            :class="{ 'border-t border-base-200 pt-4': ticket.provider || ticket.assignee }"
            @submit.prevent="submitAssign(ticket.id)"
          >
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <FormField id="assigneeUserId" label="Suivi interne (obligatoire)">
                <select v-model="selectedAssigneeUserId" class="select select-bordered w-full">
                  <option :value="null">{{ ticket.assignee ? 'Réassigner…' : 'Sélectionner…' }}</option>
                  <option v-for="a in assignees" :key="a.id" :value="a.id">
                    {{ a.fullName ?? `#${a.id}` }}
                  </option>
                </select>
              </FormField>

              <FormField id="providerId" label="Prestataire">
                <select v-model="selectedProviderId" class="select select-bordered w-full">
                  <option :value="null">{{ ticket.provider ? 'Réassigner…' : 'Aucun prestataire' }}</option>
                  <option
                    v-for="provider in providers"
                    :key="provider.id"
                    :value="provider.id"
                  >
                    {{ provider.companyName }} — {{ provider.speciality }}
                  </option>
                </select>
              </FormField>
            </div>

            <div class="flex items-center justify-end">
              <BaseButton
                type="submit"
                :disabled="!canSubmitAssign"
                label="Enregistrer"
                class="min-w-44"
              />
            </div>
          </form>
        </div>
      </BaseCard>
    </div>

    <div v-if="canChangeStatus" class="rounded-lg border border-base-300 bg-base-100 p-6">
      <div class="mb-3 text-xs uppercase tracking-wide text-secondary">Statut</div>

      <form class="space-y-4" @submit.prevent="submitStatus(ticket.id)">
        <div class="rounded-md bg-base-200/40 p-4">
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
                  <ChevronDownIcon class="h-4 w-4 text-base-content" />
                </span>
                <span class="flex h-4 w-4 items-center justify-center rounded-full border" :class="stepDotClass(status)">
                  <span v-if="status === ticket.status" class="h-1.5 w-1.5 rounded-full bg-base-100"></span>
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
                :class="idx < currentIndex ? 'bg-primary' : 'bg-base-300'"
              ></div>
            </template>
          </div>

          <div v-if="allowedStatusTransitions.length" class="mt-5">
            <div class="mb-2 text-xs uppercase tracking-wide text-secondary">
              Prochaines étapes possibles
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="nextStatus in allowedStatusTransitions"
                :key="nextStatus"
                type="button"
                class="rounded-md border px-3 py-1.5 text-sm font-medium transition-colors border-base-300"
                :class="
                  statusValue === nextStatus
                    ? 'border-primary bg-primary text-primary-content'
                    : 'bg-base-100 text-success hover:bg-success/10'
                "
                @click="statusValue = isTicketStatus(nextStatus) ? nextStatus : statusValue"
              >
                {{ statusLabel(nextStatus) }}
              </button>
            </div>
          </div>

          <p v-if="allowedStatusTransitions.length === 0" class="mt-3 text-sm italic text-muted">
            Aucune transition autorisée depuis {{ statusLabel(ticket.status) }}.
          </p>
        </div>

        <div class="flex items-center justify-between gap-3">
          <button
            type="submit"
            :disabled="isSubmitDisabled"
            class="btn btn-primary"
          >
            Mettre à jour
          </button>

          <button
            v-if="isSelectionChanged"
            type="button"
            @click="resetStatusSelection"
            class="btn btn-outline"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>

    <BaseCard title="Commentaires">
      <div class="space-y-3">
        <div v-for="c in comments" :key="c.id" class="rounded-md bg-base-200/40 p-3">
          <div class="mb-1 text-xs text-muted">
            {{ c.user?.fullName ?? c.user?.email }}
            <span
              v-if="c.isInternal"
              class="ml-2 rounded bg-warning/20 px-2 py-0.5 text-warning"
              >interne</span
            >
          </div>
          <p class="text-sm text-base-content">{{ c.content }}</p>
        </div>
      </div>

      <form class="mt-4 space-y-3" @submit.prevent="submitComment(ticket.id)">
        <FormField id="comment" label="Nouveau commentaire">
          <textarea
            v-model="comment"
            rows="3"
            class="textarea textarea-bordered w-full"
            placeholder="Ajouter un commentaire..."
          />
        </FormField>
        <div class="flex items-center gap-3">
          <label
            v-if="canSeeInternal"
            class="inline-flex items-center gap-2 text-sm text-base-content"
          >
            <input v-model="isInternal" type="checkbox" />
            Commentaire interne (visible gérance uniquement)
          </label>
          <BaseButton type="submit" label="Publier" />
        </div>
      </form>
    </BaseCard>

    <BaseCard title="Pièces jointes">

      <ul v-if="attachments.length" class="space-y-2">
        <li v-for="attachment in attachments" :key="attachment.id" class="text-sm text-base-content">
          <a :href="attachment.filePath" target="_blank" class="link link-hover">{{
            attachment.originalName
          }}</a>
          <span class="ml-2 text-xs text-muted"
            >({{ Math.ceil(attachment.sizeBytes / 1024) }} KB)</span
          >
        </li>
      </ul>
      <p v-else class="text-sm italic text-muted">Aucune pièce jointe</p>

      <form
        class="mt-4 flex items-center gap-3"
        @submit.prevent="submitAttachments(ticket.id, $event)"
      >
        <input
          name="attachments"
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
          class="file-input file-input-bordered w-full"
        />
        <BaseButton
          type="submit"
          :disabled="uploadingFiles"
          label="Envoyer"
          class="shrink-0"
        />
      </form>
      <p class="mt-2 text-xs text-muted">
        Max 5 fichiers, 10MB par fichier. Formats: JPG, JPEG, PNG, GIF, WEBP, PDF.
      </p>
      <p v-if="attachmentErrors.attachments" class="mt-1 text-sm text-error">
        {{ attachmentErrors.attachments }}
      </p>
    </BaseCard>
  </div>
</template>
