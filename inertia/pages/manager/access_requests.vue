<script setup lang="ts">
import { Head, router } from '@inertiajs/vue3'
import { reactive } from 'vue'

const props = defineProps<{
  requests: Array<{
    id: number
    firstName: string
    lastName: string
    fullName: string | null
    email: string | null
    phone: string | null
    role: 'tenant' | 'owner'
    createdAt: string
  }>
  units: Array<{
    id: number
    label: string
    building: { id: number; name: string }
  }>
}>()

const unitByRequest = reactive<Record<number, number | null>>({})

function approve(requestId: number, relation: 'tenant' | 'owner') {
  const unitId = unitByRequest[requestId]
  if (!unitId) return

  router.post(`/manager/access-requests/${requestId}/approve`, {
    unitId,
    relation,
  })
}

function reject(requestId: number) {
  router.post(`/manager/access-requests/${requestId}/reject`, {})
}
</script>

<template>
  <Head title="Demandes d'acces" />

  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-gray-900">Demandes d'acces</h1>
      <p class="mt-1 text-sm text-gray-500">Validation des inscriptions locataires/proprietaires.</p>
    </div>

    <div v-if="requests.length === 0" class="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
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
            <p class="text-sm text-gray-600">{{ request.email ?? '-' }} - {{ request.phone ?? '-' }}</p>
            <p class="text-xs text-gray-500">Role demande: {{ request.role }}</p>
          </div>
          <span class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">ID #{{ request.id }}</span>
        </div>

        <div class="mt-4 flex items-end gap-3">
          <div class="flex-1">
            <label class="mb-1 block text-sm font-medium text-gray-700">Logement a assigner</label>
            <select
              v-model.number="unitByRequest[request.id]"
              class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option :value="null">Choisir un logement</option>
              <option v-for="unit in units" :key="unit.id" :value="unit.id">
                {{ unit.building.name }} - {{ unit.label }}
              </option>
            </select>
          </div>

          <button
            type="button"
            class="rounded-md bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
            :disabled="!unitByRequest[request.id]"
            @click="approve(request.id, request.role)"
          >
            Approuver
          </button>
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
</template>
