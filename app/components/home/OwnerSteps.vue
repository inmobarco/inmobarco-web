<script setup lang="ts">
/**
 * El único bloque numerado del sitio, porque sí es una secuencia (§7.1, bloque 8).
 */
const steps = [
  {
    title: 'Avalúo y publicación',
    text: 'Visitamos el inmueble, definimos contigo el canon de mercado y lo publicamos donde buscan los arrendatarios.',
  },
  {
    title: 'Selección y contrato',
    text: 'Mostramos el inmueble, estudiamos a los candidatos y firmamos el contrato junto con el inventario inicial.',
  },
  {
    title: 'Administración mensual',
    text: 'Facturamos, cobramos, atendemos los mantenimientos y te consignamos el canon con su estado de cuenta.',
  },
]
</script>

<template>
  <section class="mx-auto max-w-page px-4 py-16 md:px-6 md:py-24">
    <div class="max-w-[52ch]">
      <h2 class="text-2xl md:text-3xl">
        Cómo administramos tu inmueble
      </h2>
      <p class="mt-3 text-lg text-muted">
        Tres pasos, sin trámites que tengas que hacer tú.
      </p>
    </div>

    <ol class="mt-10 grid gap-8 md:grid-cols-3">
      <li v-for="(step, index) in steps" :key="step.title">
        <p data-numeric class="font-display text-[2.4rem] leading-none font-bold text-primary">
          {{ index + 1 }}
        </p>
        <h3 class="mt-4 font-sans text-base font-semibold tracking-normal">
          {{ step.title }}
        </h3>
        <p class="mt-2 max-w-[42ch] text-muted">
          {{ step.text }}
        </p>
      </li>
    </ol>

    <div class="mt-10">
      <BaseButton to="/propietarios">
        Consigna tu inmueble
      </BaseButton>
    </div>
  </section>
</template>
