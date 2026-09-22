<script setup lang="ts">
import { PARTNERS } from '#shared/data/partners'

/**
 * No se pinta nada mientras no haya aliados confirmados: publicar los nombres de
 * relleno del mockup sería inventar alianzas (§16).
 */
</script>

<template>
  <section v-if="PARTNERS.length" class="bg-surface">
    <div class="mx-auto max-w-page px-4 py-12 md:px-6">
      <h2 class="text-xl">
        Con quién trabajamos
      </h2>

      <ul class="mt-8 flex flex-wrap items-center justify-between gap-7">
        <li v-for="partner in PARTNERS" :key="partner.name">
          <component
            :is="partner.url ? 'a' : 'span'"
            :href="partner.url"
            :target="partner.url ? '_blank' : undefined"
            :rel="partner.url ? 'noopener noreferrer' : undefined"
            class="flex items-center"
          >
            <img
              v-if="partner.logo"
              :src="partner.logo"
              :alt="partner.name"
              height="32"
              class="h-8 w-auto"
            >
            <span v-else class="font-display text-[1.15rem] font-bold text-neutral-400">
              {{ partner.name }}
            </span>
            <span v-if="partner.url" class="sr-only">(abre en una nueva pestaña)</span>
          </component>
        </li>
      </ul>
    </div>
  </section>
</template>
