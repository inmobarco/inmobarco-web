<script setup lang="ts">
import { COMPANY } from '#shared/data/legal'
import { EXTERNAL_LINKS } from '#shared/data/links'

const site = useSiteConfig()

useSeoMeta({
  title: 'Arrendamiento y administración de inmuebles en el Valle de Aburrá',
  description: 'Inmobarco administra y arrienda apartamentos, casas y locales en Medellín, Envigado, Sabaneta, Itagüí y La Estrella. Mira el inventario disponible.',
})

useHead({ link: [{ rel: 'canonical', href: site.url }] })

// Organización y agencia inmobiliaria, una sola vez y en la home (§9.2).
useSchemaOrg([
  defineOrganization({
    name: COMPANY.legalName,
    alternateName: 'Inmobarco',
    taxID: COMPANY.nit,
    logo: '/brand/icon-512.png',
    telephone: COMPANY.phone,
    email: COMPANY.email,
    address: {
      streetAddress: COMPANY.address,
      addressLocality: 'Medellín',
      addressRegion: 'Antioquia',
      addressCountry: 'CO',
    },
  }),
  {
    '@type': 'RealEstateAgent',
    'name': 'Inmobarco Inmobiliaria',
    'url': site.url,
    'telephone': COMPANY.phone,
    'email': COMPANY.email,
    'areaServed': ['Medellín', 'Envigado', 'Sabaneta', 'Itagüí', 'La Estrella'],
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': COMPANY.address,
      'addressLocality': 'Medellín',
      'addressRegion': 'Antioquia',
      'addressCountry': 'CO',
    },
  },
])
</script>

<template>
  <div>
    <!-- Orden de bloques del §7.1: no negociable -->
    <HeroSearch />
    <ZoneTiles />
    <FeaturedProperties />
    <DualPath />
    <ValueProps />
    <OwnerSteps />
    <PartnerLogos />
    <ClosingCta />

    <!-- Accesos externos del §6.2, también desde la home -->
    <section class="mx-auto max-w-page px-4 py-12 md:px-6">
      <div class="flex flex-wrap items-center justify-center gap-4">
        <BaseButton :href="EXTERNAL_LINKS.payments" variant="ghost">
          Pagar arriendo
        </BaseButton>
        <BaseButton :href="EXTERNAL_LINKS.clientArea" variant="ghost">
          Área de clientes
        </BaseButton>
      </div>
    </section>
  </div>
</template>
