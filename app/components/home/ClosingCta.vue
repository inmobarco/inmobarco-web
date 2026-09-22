<script setup lang="ts">
import { whatsappLink } from '#shared/data/links'
import { CONTACT } from '#shared/data/legal'
</script>

<template>
  <section class="bg-ink text-white">
    <div class="mx-auto flex max-w-page flex-wrap items-center justify-between gap-10 px-4 py-16 md:px-6 md:py-20">
      <div>
        <h2 class="max-w-[18ch] text-2xl text-white md:text-3xl">
          ¿Hablamos de tu inmueble?
        </h2>
        <p class="mt-3 max-w-[46ch] text-white/75">
          Escríbenos por WhatsApp o llámanos. Te respondemos el mismo día hábil.
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <BaseButton :href="whatsappLink()" size="lg">
          Escribir por WhatsApp
        </BaseButton>
        <BaseButton :href="CONTACT.commercial.phoneHref" variant="onInk" size="lg">
          Llamar al {{ CONTACT.commercial.phone.replace('+57 ', '') }}
        </BaseButton>
      </div>
    </div>
  </section>
</template>
