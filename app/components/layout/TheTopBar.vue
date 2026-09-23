<script setup lang="ts">
import { EXTERNAL_LINKS } from '#shared/data/links'
import { CONTACT } from '#shared/data/legal'
</script>

<template>
  <div class="bg-ink text-[0.8125rem] text-white/80">
    <div class="mx-auto flex min-h-[38px] max-w-page flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-1.5 md:px-6">
      <div class="hidden gap-6 md:flex">
        <a :href="CONTACT.commercial.phoneHref" class="whitespace-nowrap hover:text-white">{{ CONTACT.commercial.phone }}</a>
        <a :href="`mailto:${CONTACT.commercial.email}`" class="whitespace-nowrap hover:text-white">{{ CONTACT.commercial.email }}</a>
      </div>

      <!--
        Barra de utilidades: aquí viven los accesos de servicio, no los comerciales.
        PQRS es de este grupo —es atención al usuario, no conversión—, por eso va
        junto a pagar arriendo y al área de clientes, y no como CTA de la cabecera.
      -->
      <div class="ml-auto flex flex-wrap items-center gap-2">
        <a
          :href="EXTERNAL_LINKS.payments"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex h-[26px] items-center rounded-full bg-primary px-3 text-[0.8125rem] font-semibold text-ink"
        >
          Pagar arriendo
          <span class="sr-only">(abre en una nueva pestaña)</span>
        </a>
        <a
          :href="EXTERNAL_LINKS.clientArea"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex h-[26px] items-center rounded-full border border-white/30 px-3 text-[0.8125rem] font-semibold text-white"
        >
          Área de clientes
          <span class="sr-only">(abre en una nueva pestaña)</span>
        </a>
        <NuxtLink
          to="/pqrs"
          class="inline-flex h-[26px] items-center rounded-full border border-white/30 px-3 text-[0.8125rem] font-semibold text-white"
        >
          PQRS
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
