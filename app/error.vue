<script setup lang="ts">
import type { NuxtError } from '#app'
import { whatsappLink } from '#shared/data/links'

const props = defineProps<{ error: NuxtError }>()

/**
 * Página de error propia. El §5.5 pide que nunca se vea una pantalla en blanco
 * ni un stack trace; sin esto, un 404 muestra la página por defecto de Nuxt, con
 * su logo y en inglés.
 */
const isNotFound = computed(() => props.error.statusCode === 404)

const copy = computed(() => {
  if (isNotFound.value) {
    return {
      title: 'Esta página no existe',
      text: 'Puede que el inmueble ya no esté disponible o que el enlace esté mal escrito. Desde aquí puedes seguir buscando.',
    }
  }
  return {
    title: 'Algo falló de nuestro lado',
    text: 'No es problema tuyo. Vuelve a intentarlo en un momento o escríbenos y te atendemos de una vez.',
  }
})

useSeoMeta({
  title: () => copy.value.title,
  robots: 'noindex, follow',
})
</script>

<template>
  <NuxtLayout>
    <main class="mx-auto flex max-w-page flex-col items-start px-4 py-24 md:px-6 md:py-32">
      <p data-numeric class="font-display text-[4rem] leading-none font-bold text-primary">
        {{ error.statusCode }}
      </p>

      <h1 class="mt-4 text-2xl md:text-3xl">
        {{ copy.title }}
      </h1>

      <p class="mt-4 max-w-[52ch] text-lg text-muted">
        {{ copy.text }}
      </p>

      <div class="mt-8 flex flex-wrap gap-3">
        <BaseButton to="/arriendo">
          Ver inmuebles en arriendo
        </BaseButton>
        <BaseButton to="/" variant="ghost">
          Ir al inicio
        </BaseButton>
        <BaseButton :href="whatsappLink()" variant="ghost">
          Escribir por WhatsApp
        </BaseButton>
      </div>
    </main>
  </NuxtLayout>
</template>
