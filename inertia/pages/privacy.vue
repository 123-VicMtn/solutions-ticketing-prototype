<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import BaseCard from '~/components/common/cards/BaseCard.vue'
</script>

<template>
  <Head title="Confidentialité" />

  <div class="mx-auto w-full max-w-3xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-base-content">Confidentialité</h1>
      <p class="mt-1 text-sm text-muted">
        Informations sur le traitement des données et la confidentialité.
      </p>
    </div>

    <BaseCard bodyClass="p-6 sm:p-8">
      <div class="prose prose-sm max-w-none">
        <p>
          Cette application est un prototype. Les données affichées peuvent être fictives et la
          disponibilité du service n’est pas garantie.
        </p>
        <p>
          Pour toute question, consultez la page Support ou contactez l’équipe via les coordonnées
          indiquées.
        </p>
      </div>
    </BaseCard>
  </div>
</template>
