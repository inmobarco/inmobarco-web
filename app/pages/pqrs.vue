<script setup lang="ts">
import { PQRS_PAGE } from '#shared/data/pages'
import { whatsappLink } from '#shared/data/links'
import { CONTACT } from '#shared/data/legal'

/**
 * El formulario con número de radicado (§8.3) necesita servidor y webhook.
 * Hasta entonces la página explica el canal y deja los medios de contacto, que
 * es mejor que un 404 en una obligación de atención al usuario.
 */
</script>

<template>
  <ContentPage :content="PQRS_PAGE">
    <template #before-sections>
      <div class="mt-8 rounded-lg border border-line p-6">
        <h2 class="text-lg">
          Mientras habilitamos el formulario en línea
        </h2>
        <p class="mt-3 text-muted">
          Radica tu solicitud por correo o por WhatsApp y te confirmamos el recibido con su
          número de radicado.
        </p>
        <div class="mt-5 flex flex-wrap gap-3">
          <BaseButton :href="`mailto:${CONTACT.legal.email}?subject=PQRS`">
            Escribir a {{ CONTACT.legal.email }}
          </BaseButton>
          <BaseButton :href="whatsappLink()" variant="ghost">
            Escribir por WhatsApp
          </BaseButton>
        </div>
      </div>
    </template>
  </ContentPage>
</template>
