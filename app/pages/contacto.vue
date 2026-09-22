<script setup lang="ts">
import { CONTACTO } from '#shared/data/pages'
import { whatsappLink } from '#shared/data/links'
import { COMPANY, CONTACT } from '#shared/data/legal'

const route = useRoute()

/** La ficha enlaza aquí con ?inmueble=CODIGO para que no haya que repetirlo. */
const propertyCode = computed(() => {
  const value = route.query.inmueble
  return typeof value === 'string' && /^\d+$/.test(value) ? value : undefined
})
</script>

<template>
  <ContentPage :content="CONTACTO">
    <template #before-sections>
      <p v-if="propertyCode" data-numeric class="mt-6 rounded-md bg-surface px-4 py-3 text-sm">
        Nos escribes por el inmueble <strong class="font-semibold">{{ propertyCode }}</strong>.
      </p>

      <dl class="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <dt class="text-xs font-semibold text-muted">
            Arriendo, venta y visitas
          </dt>
          <dd class="mt-1 flex flex-col">
            <a :href="CONTACT.commercial.phoneHref" data-numeric class="font-semibold hover:text-secondary">
              {{ CONTACT.commercial.phone }}
            </a>
            <a :href="`mailto:${CONTACT.commercial.email}`" class="font-semibold hover:text-secondary">
              {{ CONTACT.commercial.email }}
            </a>
          </dd>
        </div>
        <div>
          <dt class="text-xs font-semibold text-muted">
            Trámites y asuntos administrativos
          </dt>
          <dd class="mt-1 flex flex-col">
            <a :href="CONTACT.legal.phoneHref" data-numeric class="font-semibold hover:text-secondary">
              {{ CONTACT.legal.phone }}
            </a>
            <a :href="`mailto:${CONTACT.legal.email}`" class="font-semibold hover:text-secondary">
              {{ CONTACT.legal.email }}
            </a>
          </dd>
        </div>
        <div>
          <dt class="text-xs font-semibold text-muted">
            Mantenimiento
          </dt>
          <dd class="mt-1">
            <a :href="`mailto:${CONTACT.maintenance.email}`" class="font-semibold hover:text-secondary">
              {{ CONTACT.maintenance.email }}
            </a>
          </dd>
        </div>
        <div>
          <dt class="text-xs font-semibold text-muted">
            Oficina
          </dt>
          <dd class="mt-1 font-semibold">
            {{ COMPANY.address }}<br>
            {{ COMPANY.addressDetail }}<br>
            {{ COMPANY.city }}
          </dd>
        </div>
      </dl>

      <div class="mt-8">
        <BaseButton :href="whatsappLink(propertyCode)" size="lg">
          Escribir por WhatsApp
        </BaseButton>
      </div>
    </template>
  </ContentPage>
</template>
