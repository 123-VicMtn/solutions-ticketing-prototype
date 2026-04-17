<script setup lang="ts">
import { Head, router } from '@inertiajs/vue3'
import { reactive } from 'vue'
import type { Data } from '@generated/data'
import BaseCard from '~/components/common/cards/BaseCard.vue'
import BaseButton from '~/components/common/buttons/BaseButton.vue'
import FormField from '~/components/common/forms/FormField.vue'

const props = defineProps<{
  requests: Data.User[]
  units: Data.Unit[]
}>()

const unitByRequest = reactive<Record<number, number | null>>({})
const rejectReasonByRequest = reactive<Record<number, string>>({})

function approve(requestId: number, role: string) {
  const unitId = unitByRequest[requestId]
  if (!unitId) return
  if (role !== 'tenant' && role !== 'owner') return

  router.post(`/manager/access-requests/${requestId}/approve`, {
    unitId,
    relation: role,
  })
}

function reject(requestId: number) {
  router.post(`/manager/access-requests/${requestId}/reject`, {
    reason: rejectReasonByRequest[requestId]?.trim() || undefined,
  })
}
</script>

<template>
  <Head title="Demandes d'accès" />

  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-base-content">Demandes d'accès</h1>
      <p class="mt-1 text-sm text-muted">Validation des inscriptions locataires/propriétaires.</p>
    </div>

    <BaseCard v-if="requests.length === 0" bodyClass="p-6 sm:p-8">
      <div class="text-sm text-muted">Aucune demande en attente.</div>
    </BaseCard>

    <div v-else class="space-y-4">
      <BaseCard
        v-for="request in requests"
        :key="request.id"
        bodyClass="p-6 sm:p-8"
      >
        <div>
          <p class="text-base font-semibold text-base-content">
            {{ request.fullName ?? `${request.firstName} ${request.lastName}` }}
          </p>
          <p class="text-sm text-muted">
            {{ request.email ?? '-' }} - {{ request.phone ?? '-' }}
          </p>
          <p class="text-xs text-muted">Rôle demandé: {{ request.role }}</p>
        </div>

        <div class="mt-4 space-y-3">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div class="min-w-0 flex-1">
              <FormField :id="`unit-${request.id}`" label="Logement à assigner">
                <select
                  :id="`unit-${request.id}`"
                  v-model.number="unitByRequest[request.id]"
                  class="select select-bordered w-full"
                >
                  <option :value="null">Choisir un logement</option>
                  <option v-for="unit in units" :key="unit.id" :value="unit.id">
                    {{ unit.building?.name }} - {{ unit.label }}
                  </option>
                </select>
              </FormField>
            </div>

            <BaseButton
              type="button"
              variant="success"
              class="w-full shrink-0 sm:w-auto"
              :disabled="!unitByRequest[request.id]"
              label="Approuver"
              @click="approve(request.id, request.role)"
            />
          </div>

          <FormField :id="`reject-${request.id}`" label="Motif du rejet (optionnel, envoyé par email)">
            <textarea
              :id="`reject-${request.id}`"
              v-model="rejectReasonByRequest[request.id]"
              rows="2"
              class="textarea textarea-bordered w-full"
              placeholder="Ex. Informations erronées..."
            />
          </FormField>

          <div class="flex justify-end">
            <BaseButton
              type="button"
              variant="error"
              class="btn-outline"
              label="Rejeter"
              @click="reject(request.id)"
            />
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
