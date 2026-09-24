<script setup lang="ts">
import { findLegalDocument, LEGAL_DOCUMENTS } from '#shared/data/legal-documents'
import { COMPANY } from '#shared/data/legal'
import { slugify } from '#shared/utils/slug'

// Un slug legal que no esté en el diccionario devuelve 404, igual que en listados.
definePageMeta({
  validate: route => typeof route.params.slug === 'string' && Boolean(findLegalDocument(route.params.slug)),
})

const route = useRoute()
const site = useSiteConfig()

const document = computed(() => findLegalDocument(String(route.params.slug))!)

const updatedLabel = computed(() => {
  if (!document.value.updatedAt) return null
  // `new Date('2026-01-15')` es medianoche UTC; formateado en hora de Colombia
  // (UTC-5) retrocede al día anterior. Se formatea en UTC, que es la fecha que
  // el dato realmente representa.
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeZone: 'UTC' })
    .format(new Date(document.value.updatedAt))
})

// Solo lo aprobado se indexa: un borrador sin revisar no debe salir en Google.
useSeoMeta({
  title: () => document.value.title,
  description: () => (document.value.status === 'published' ? document.value.description : undefined),
  robots: () => (document.value.status === 'published' ? 'index, follow' : 'noindex, follow'),
})

useHead({ link: [{ rel: 'canonical', href: () => `${site.url}${route.path}` }] })
</script>

<template>
  <main class="mx-auto max-w-page px-4 py-12 md:px-6 md:py-16">
    <div class="grid gap-12 lg:grid-cols-[minmax(0,1fr)_260px]">
      <article class="max-w-[68ch] [&_h2]:scroll-mt-28">
        <h1 class="text-2xl md:text-3xl">
          {{ document.title }}
        </h1>

        <p class="mt-3 text-sm text-muted">
          {{ COMPANY.legalName }} · NIT <span data-numeric>{{ COMPANY.nit }}</span>
          <template v-if="updatedLabel">
            · Actualizada el <time :datetime="document.updatedAt">{{ updatedLabel }}</time>
          </template>
          · Versión <span data-numeric>{{ document.version }}</span>
        </p>

        <PendingNotice
          v-if="document.status === 'pending'"
          class="mt-8"
          what="el texto legal definitivo"
        />
        <PendingNotice
          v-else-if="document.status === 'draft'"
          class="mt-8"
          what="la revisión jurídica de este borrador"
          tone="draft"
        />

        <section v-for="section in document.sections" :key="section.heading" class="mt-10">
          <h2 :id="slugify(section.heading ?? '')" class="text-xl">
            {{ section.heading }}
          </h2>
          <ContentSections :section="section" />
        </section>
      </article>

      <nav aria-label="Contenido del documento" class="lg:sticky lg:top-24 lg:self-start">
        <p class="text-sm font-semibold">
          En esta página
        </p>
        <ul class="mt-3 space-y-2 border-l border-line pl-4 text-sm text-muted">
          <li v-for="section in document.sections" :key="section.heading">
            <a :href="`#${slugify(section.heading ?? '')}`" class="hover:text-ink">
              {{ section.heading }}
            </a>
          </li>
        </ul>

        <p class="mt-8 text-sm font-semibold">
          Otros documentos
        </p>
        <ul class="mt-3 space-y-2 text-sm text-muted">
          <li v-for="other in LEGAL_DOCUMENTS.filter(item => item.slug !== document.slug)" :key="other.slug">
            <NuxtLink :to="`/legal/${other.slug}`" class="hover:text-ink">
              {{ other.title }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>
  </main>
</template>
