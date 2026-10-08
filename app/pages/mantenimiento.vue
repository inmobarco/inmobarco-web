<script setup lang="ts">
import { MANTENIMIENTO_PAGE } from '#shared/data/pages'
import { whatsappLink } from '#shared/data/links'
import { CONTACT } from '#shared/data/legal'

/**
 * Reporte de fallas para quien ya tiene contrato con Inmobarco. Sustituye a la
 * antigua página de PQRS (`docs/DECISIONS.md`, punto 48): el canal legal de
 * peticiones, quejas y reclamos sigue publicado en la política de tratamiento.
 * No hay atajo de emergencia fuera del formulario: la urgencia se filtra
 * internamente por tipo de avería.
 */
const formEnabled = useFormsEnabled()
</script>

<template>
  <ContentPage :content="MANTENIMIENTO_PAGE" hide-pending-notice>
    <template #before-sections>
      <div class="mt-8 rounded-lg border border-line p-6 md:p-8">
        <template v-if="formEnabled">
          <MaintenanceForm />
        </template>

        <template v-else>
          <h2 class="text-lg">
            Mientras habilitamos el formulario
          </h2>
          <p class="mt-3 text-muted">
            Repórtanos la falla por WhatsApp o por correo y te confirmamos el recibido con su
            número de radicado.
          </p>
          <div class="mt-5 flex flex-wrap gap-3">
            <BaseButton :href="whatsappLink()">
              Reportar por WhatsApp
            </BaseButton>
            <BaseButton :href="`mailto:${CONTACT.commercial.email}?subject=Reporte de mantenimiento`" variant="ghost">
              Escribir a {{ CONTACT.commercial.email }}
            </BaseButton>
          </div>
        </template>
      </div>
    </template>
  </ContentPage>
</template>
