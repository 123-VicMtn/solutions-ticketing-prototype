<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import BaseCard from '~/components/common/cards/BaseCard.vue'
import BaseButton from '~/components/common/buttons/BaseButton.vue'

const REPO_URL = 'https://github.com/123-VicMtn/solutions-ticketing-prototype'
const ISSUES_URL = 'https://github.com/123-VicMtn/solutions-ticketing-prototype/issues'
const DOCS_URL = 'https://github.com/123-VicMtn/solutions-ticketing-prototype/wiki/Plan-d-action'

const SUPPORT_EMAIL = 'v.montavon@123-soleil.ch'
const SUPPORT_PHONE = '+41 27 565 02 93'
</script>

<template>
  <Head title="Support" />

  <div class="mx-auto w-full max-w-3xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-base-content">Support</h1>
      <p class="mt-1 text-sm text-muted">
        Besoin d’aide ? Retrouvez les ressources et moyens de contact ci-dessous.
      </p>
    </div>

    <BaseCard title="Aide & ressources" bodyClass="p-6 sm:p-8">
      <div class="space-y-4">
        <div class="grid gap-3 sm:grid-cols-3">
          <BaseButton
            label="Dépôt GitHub"
            variant="outline"
            :href="REPO_URL"
          />
          <BaseButton
            label="Ouvrir un ticket (GitHub)"
            variant="outline"
            :href="ISSUES_URL"
          />
          <BaseButton
            label="Documentation"
            variant="outline"
            :href="DOCS_URL"
          />
        </div>

        <div class="text-sm text-muted">
          <p class="text-base-content font-medium">Pour une demande rapide</p>
          <p class="mt-1">
            Décrivez votre problème de la manière la plus précise possible, joignez des captures d’écran, l’URL de la page, et dans la mesure du possible l'erreur retournée par le système.
          </p>
        </div>
      </div>
    </BaseCard>

    <BaseCard title="Contact" bodyClass="p-6 sm:p-8">
      <div class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="rounded-lg border border-base-300 bg-base-100 p-4">
            <div class="text-sm text-muted">Email</div>
            <a class="link link-primary break-all" :href="`mailto:${SUPPORT_EMAIL}`">
              {{ SUPPORT_EMAIL }}
            </a>
          </div>
          <div class="rounded-lg border border-base-300 bg-base-100 p-4">
            <div class="text-sm text-muted">Téléphone</div>
            <a class="link link-primary" :href="`tel:${SUPPORT_PHONE.replace(/\\s+/g, '')}`">
              {{ SUPPORT_PHONE }}
            </a>
          </div>
        </div>

      </div>
    </BaseCard>
  </div>
</template>
