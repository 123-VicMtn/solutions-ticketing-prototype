<script setup lang="ts">
import { Head, router } from '@inertiajs/vue3'
import { reactive } from 'vue'
import type { Data } from '@generated/data'

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
  <Head title="Demandes d'acces" />

  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-gray-900">Demandes d'acces</h1>
      <p class="mt-1 text-sm text-gray-500">
        Validation des inscriptions locataires/proprietaires.
      </p>
    </div>

    <div
      v-if="requests.length === 0"
      class="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600"
    >
      Aucune demande en attente.
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="request in requests"
        :key="request.id"
        class="rounded-lg border border-gray-200 bg-white p-6"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-base font-semibold text-gray-900">
              {{ request.fullName ?? `${request.firstName} ${request.lastName}` }}
            </p>
            <p class="text-sm text-gray-600">
              {{ request.email ?? '-' }} - {{ request.phone ?? '-' }}
            </p>
            <p class="text-xs text-gray-500">Role demande: {{ request.role }}</p>
          </div>
        </div>

        <div class="mt-4 space-y-3">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div class="min-w-0 flex-1">
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Logement à assigner</label
              >
              <select
                v-model.number="unitByRequest[request.id]"
                class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option :value="null">Choisir un logement</option>
                <option v-for="unit in units" :key="unit.id" :value="unit.id">
                  {{ unit.building?.name }} - {{ unit.label }}
                </option>
              </select>
            </div>

            <button
              type="button"
              class="shrink-0 rounded-md bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
              :disabled="!unitByRequest[request.id]"
              @click="approve(request.id, request.role)"
            >
              Approuver
            </button>
          </div>

          <div>
            <label
              class="mb-1 block text-xs font-medium text-gray-600"
              :for="`reject-${request.id}`"
            >
              Motif du rejet (optionnel, envoyé par email)
            </label>
            <textarea
              :id="`reject-${request.id}`"
              v-model="rejectReasonByRequest[request.id]"
              rows="2"
              class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Ex. Informations éronnées..."
            />
          </div>

          <div class="flex justify-end">
            <button
              type="button"
              class="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700"
              @click="reject(request.id)"
            >
              Rejeter
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
