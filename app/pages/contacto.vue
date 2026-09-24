<script setup lang="ts">
import { CONTACTO } from '#shared/data/pages'
import { whatsappLink } from '#shared/data/links'
import { COMPANY, CONTACT } from '#shared/data/legal'
const route = useRoute()

/**
 * El §13 no deja pedir datos personales antes de publicar la política de
 * tratamiento y el aviso de privacidad. Mientras falte alguno, la página ofrece
 * los canales directos en vez del formulario.
 */
const formEnabled = useFormsEnabled()

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
            Novedades de mantenimiento
          </dt>
          <dd class="mt-1">
            <NuxtLink to="/pqrs" class="font-semibold hover:text-secondary">
              Radícalas por PQRS
            </NuxtLink>
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

      <section class="mt-12 border-t border-line pt-10">
        <h2 class="text-xl">
          Escríbenos
        </h2>

        <template v-if="formEnabled">
          <p class="mt-3 text-muted">
            Déjanos tus datos y te respondemos el siguiente día hábil.
          </p>
          <ContactForm class="mt-8" :property-code="propertyCode" />
        </template>

        <div v-else class="mt-4 rounded-lg border border-line bg-surface p-6">
          <p class="text-muted">
            El formulario en línea se habilita cuando publiquemos el aviso de privacidad.
            Mientras tanto, escríbenos por WhatsApp o al correo comercial: se atiende igual
            de rápido.
          </p>
        </div>
      </section>
    </template>
  </ContentPage>
</template>
