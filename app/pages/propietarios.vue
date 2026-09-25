<script setup lang="ts">
import { PROPIETARIOS } from '#shared/data/pages'
import { whatsappLink } from '#shared/data/links'
import { CONTACT } from '#shared/data/legal'

/**
 * La página de conversión más importante del negocio (§7.4), así que el
 * formulario es el protagonista y no un añadido al final: el §7.4 pide un solo
 * CTA visible por pantalla, y aquí ese CTA es entregar el inmueble.
 *
 * El teléfono y WhatsApp quedan al final, como salida para quien prefiere hablar
 * antes de dejar datos.
 */
const formEnabled = useFormsEnabled()
</script>

<template>
  <ContentPage :content="PROPIETARIOS">
    <template #before-sections>
      <div class="mt-8 rounded-lg border border-line p-6 md:p-8">
        <h2 class="text-xl">
          Cuéntanos de tu inmueble
        </h2>

        <template v-if="formEnabled">
          <p class="mt-3 max-w-[60ch] text-muted">
            Déjanos los datos básicos y un asesor te contacta el siguiente día hábil para
            coordinar la visita de avalúo. No tiene costo ni te compromete a nada.
          </p>
          <ConsignForm class="mt-8" />
        </template>

        <div v-else class="mt-4">
          <p class="text-muted">
            El formulario en línea se habilita cuando publiquemos las páginas legales. Mientras
            tanto, escríbenos por WhatsApp y coordinamos la visita de avalúo igual de rápido.
          </p>
          <BaseButton :href="whatsappLink()" size="lg" class="mt-6">
            Hablar con un asesor
          </BaseButton>
        </div>
      </div>
    </template>

    <div class="mt-12 rounded-lg bg-surface p-8">
      <h2 class="text-xl">
        ¿Prefieres hablar primero?
      </h2>
      <p class="mt-3 text-muted">
        Escríbenos o marca directamente y resolvemos tus dudas antes de que dejes ningún dato.
      </p>
      <div class="mt-6 flex flex-wrap gap-3">
        <BaseButton :href="whatsappLink()" variant="ghost">
          Escribir por WhatsApp
        </BaseButton>
        <BaseButton :href="CONTACT.commercial.phoneHref" variant="ghost">
          Llamar al {{ CONTACT.commercial.phone.replace('+57 ', '') }}
        </BaseButton>
      </div>
    </div>
  </ContentPage>
</template>
