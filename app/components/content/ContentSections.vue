<script setup lang="ts">
import type { ContentSection } from '#shared/data/pages'

/**
 * Cuerpo de una sección de contenido. Se comparte entre las páginas
 * institucionales y los documentos legales para que un mismo texto se vea igual
 * en los dos sitios.
 */
defineProps<{ section: ContentSection }>()
</script>

<template>
  <div v-if="section.body" class="mt-3 space-y-4 text-muted">
    <p v-for="(paragraph, index) in section.body" :key="index">
      {{ paragraph }}
    </p>
  </div>

  <ul v-if="section.bullets" class="mt-4 space-y-2 text-muted">
    <li v-for="bullet in section.bullets" :key="bullet" class="flex gap-2">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="mt-1.5 flex-none text-secondary" aria-hidden="true">
        <path d="M4 12l5 5 11-11" />
      </svg>
      {{ bullet }}
    </li>
  </ul>

  <dl v-if="section.definitions" class="mt-5 space-y-4">
    <div v-for="definition in section.definitions" :key="definition.term">
      <dt class="font-sans text-base font-semibold">
        {{ definition.term }}
      </dt>
      <dd class="mt-1 text-muted">
        {{ definition.description }}
      </dd>
    </div>
  </dl>

  <div v-if="section.groups" class="mt-5 space-y-6">
    <div v-for="group in section.groups" :key="group.title">
      <h3 class="font-sans text-base font-semibold tracking-normal">
        {{ group.title }}
      </h3>
      <ul class="mt-2 space-y-2 text-muted">
        <li v-for="bullet in group.bullets" :key="bullet" class="flex gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="mt-1.5 flex-none text-secondary" aria-hidden="true">
            <path d="M4 12l5 5 11-11" />
          </svg>
          {{ bullet }}
        </li>
      </ul>
    </div>
  </div>
</template>
