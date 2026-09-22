<script setup lang="ts">
import type { ContentPage } from '#shared/data/pages'

const props = defineProps<{ content: ContentPage }>()

const route = useRoute()
const site = useSiteConfig()

/** Mismo criterio que en los listados: sin contenido real, no se indexa. */
useSeoMeta({
  title: () => props.content.title,
  description: () => (props.content.pending ? undefined : props.content.description),
  robots: () => (props.content.pending ? 'noindex, follow' : 'index, follow'),
})

useHead({ link: [{ rel: 'canonical', href: `${site.url}${route.path}` }] })

useSchemaOrg(computed(() => [
  defineBreadcrumb({
    itemListElement: [
      { name: 'Inicio', item: '/' },
      { name: props.content.title, item: route.path },
    ],
  }),
]))
</script>

<template>
  <main class="mx-auto max-w-page px-4 py-12 md:px-6 md:py-16">
    <div class="max-w-[68ch]">
      <h1 class="text-2xl md:text-3xl">
        {{ content.title }}
      </h1>

      <p v-if="content.intro" class="mt-4 text-lg text-muted">
        {{ content.intro }}
      </p>

      <PendingNotice v-if="content.pending" class="mt-8" />

      <!-- Bloque libre para lo que cada página añade sobre el contenido base -->
      <slot name="before-sections" />

      <section v-for="(section, index) in content.sections" :key="index" class="mt-10">
        <h2 v-if="section.heading" class="text-xl">
          {{ section.heading }}
        </h2>
        <ContentSections :section="section" />
      </section>

      <slot />
    </div>
  </main>
</template>
