<script setup lang="ts">
import { EXTERNAL_LINKS } from '#shared/data/links'
import { COMPANY } from '#shared/data/legal'
</script>

<template>
  <div class="bg-ink text-[0.8125rem] text-white/80">
    <div class="mx-auto flex min-h-[38px] max-w-page items-center justify-between gap-4 px-4 md:px-6">
      <div class="hidden gap-6 md:flex">
        <a :href="COMPANY.phoneHref" class="whitespace-nowrap hover:text-white">{{ COMPANY.phone }}</a>
        <a :href="`mailto:${COMPANY.email}`" class="whitespace-nowrap hover:text-white">{{ COMPANY.email }}</a>
      </div>

      <div class="ml-auto flex items-center gap-2">
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
      </div>
    </div>
  </div>
</template>
