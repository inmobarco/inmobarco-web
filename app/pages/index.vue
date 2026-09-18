<script setup lang="ts">
// Marcador de posición: la home real se porta desde inmobarco-home-mockup.html.
useSeoMeta({
  title: 'Inmobarco Inmobiliaria',
  description: 'Arrendamiento y administración de inmuebles en el Valle de Aburrá.',
})
</script>

<template>
  <main class="mx-auto max-w-page px-4 py-24 md:px-6">
    <h1 class="text-3xl md:text-4xl">
      Inmobarco Inmobiliaria
    </h1>
    <p class="mt-4 max-w-[68ch] text-muted">
      Arrendamiento y administración de inmuebles en el Valle de Aburrá. El sitio está en
      construcción.
    </p>
    <NuxtLink
      to="/test-inventario"
      class="mt-8 inline-block rounded-md bg-primary px-6 py-3 font-medium text-ink shadow-sm"
    >
      Ver prueba de inventario
    </NuxtLink>
  </main>
</template>
