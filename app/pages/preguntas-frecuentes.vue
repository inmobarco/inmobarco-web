<script setup lang="ts">
import { FAQ } from '#shared/data/pages'
import { whatsappLink } from '#shared/data/links'

/**
 * Google retiró los resultados enriquecidos de FAQ en mayo de 2026 (§9.2): el
 * marcado se mantiene por semántica y por búsqueda con IA, no por el snippet.
 * No se emite mientras las respuestas sean relleno.
 */
const answered = computed(() => FAQ.items.filter(item => !item.pending))

useSchemaOrg(computed(() => (answered.value.length
  ? [{
      '@type': 'FAQPage',
      'mainEntity': answered.value.map(item => ({
        '@type': 'Question',
        'name': item.question,
        'acceptedAnswer': { '@type': 'Answer', 'text': item.answer },
      })),
    }]
  : [])))
</script>

<template>
  <ContentPage :content="FAQ.page">
    <dl class="mt-8 divide-y divide-line border-y border-line">
      <div v-for="item in FAQ.items" :key="item.question" class="py-5">
        <dt class="font-sans text-base font-semibold">
          {{ item.question }}
        </dt>
        <dd class="mt-2 text-muted">
          {{ item.answer }}
        </dd>
      </div>
    </dl>

    <p class="mt-10 text-muted">
      ¿No está tu pregunta?
      <a
        :href="whatsappLink()"
        target="_blank"
        rel="noopener noreferrer"
        class="font-semibold text-primary-700 underline decoration-primary-200 decoration-2 underline-offset-4 hover:decoration-primary-700"
      >
        Escríbenos por WhatsApp
        <span class="sr-only">(abre en una nueva pestaña)</span>
      </a>
      y te respondemos.
    </p>
  </ContentPage>
</template>
