<script setup lang="ts">
import { PROPIETARIOS } from '#shared/data/pages'
import { whatsappLink } from '#shared/data/links'
import { CONTACT } from '#shared/data/legal'

/**
 * La página de conversión más importante del negocio (§7.4). El formulario de
 * consignación llega cuando se monte el webhook a n8n; mientras tanto la salida
 * es WhatsApp y teléfono, que es lo que ya funciona.
 */
</script>

<template>
  <ContentPage :content="PROPIETARIOS">
    <template #before-sections>
      <!-- Un solo CTA visible por pantalla, como pide el §7.4 -->
      <div class="mt-8 flex flex-wrap gap-3">
        <BaseButton :href="whatsappLink()" size="lg">
          Hablar con un asesor
        </BaseButton>
      </div>
    </template>

    <div class="mt-12 rounded-lg bg-surface p-8">
      <h2 class="text-xl">
        ¿Prefieres que te llamemos?
      </h2>
      <p class="mt-3 text-muted">
        Escríbenos o marca directamente y coordinamos la visita de avalúo.
      </p>
      <div class="mt-6 flex flex-wrap gap-3">
        <BaseButton :href="whatsappLink()">
          Escribir por WhatsApp
        </BaseButton>
        <BaseButton :href="CONTACT.commercial.phoneHref" variant="ghost">
          Llamar al {{ CONTACT.commercial.phone.replace('+57 ', '') }}
        </BaseButton>
      </div>
    </div>
  </ContentPage>
</template>
