<script setup lang="ts">
/**
 * Imagen por defecto al compartir. Las OG automáticas por página son fase 3;
 * sin esto, compartir cualquier enlace por WhatsApp sale sin imagen. Las páginas
 * que tienen algo mejor que mostrar —la ficha, con la foto del inmueble— la
 * sobrescriben.
 */
useSeoMeta({
  ogImage: '/og-default.png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogLocale: 'es_CO',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
