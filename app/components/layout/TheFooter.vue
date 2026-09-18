<script setup lang="ts">
import { EXTERNAL_LINKS } from '#shared/data/links'
import { COMPANY, LEGAL_PAGES, RENTAL_REGISTRATIONS } from '#shared/data/legal'

const year = new Date().getFullYear()

const exploreLinks = [
  { label: 'Inmuebles en arriendo', to: '/arriendo' },
  { label: 'Inmuebles en venta', to: '/venta' },
  { label: 'Envigado', to: '/arriendo/envigado' },
  { label: 'Sabaneta', to: '/arriendo/sabaneta' },
  { label: 'Medellín', to: '/arriendo/medellin' },
  { label: 'Itagüí', to: '/arriendo/itagui' },
]

const companyLinks = [
  { label: 'Nosotros', to: '/nosotros' },
  { label: 'Propietarios', to: '/propietarios' },
  { label: 'Aliados', to: '/aliados' },
  { label: 'Contacto', to: '/contacto' },
  { label: 'PQRS', to: '/pqrs' },
  { label: 'Preguntas frecuentes', to: '/preguntas-frecuentes' },
]
</script>

<template>
  <footer class="mt-24 border-t border-line bg-surface">
    <div class="mx-auto max-w-page px-4 py-16 md:px-6">
      <div class="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <NuxtLink to="/" class="flex items-center gap-2.5" aria-label="Inmobarco, inicio">
            <BrandLogo />
            <span class="font-display text-[1.3rem] font-bold tracking-[-0.03em]">inmobarco</span>
          </NuxtLink>
          <p class="mt-4 max-w-[38ch] text-sm text-muted">
            Arrendamiento y administración de inmuebles en Medellín y el sur del Valle de Aburrá.
          </p>
        </div>

        <div>
          <h2 class="text-sm font-semibold">
            Explora
          </h2>
          <ul class="mt-4 flex flex-col gap-2.5 text-sm text-muted">
            <li v-for="link in exploreLinks" :key="link.to">
              <NuxtLink :to="link.to" class="hover:text-ink">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h2 class="text-sm font-semibold">
            Compañía
          </h2>
          <ul class="mt-4 flex flex-col gap-2.5 text-sm text-muted">
            <li v-for="link in companyLinks" :key="link.to">
              <NuxtLink :to="link.to" class="hover:text-ink">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h2 class="text-sm font-semibold">
            Accesos
          </h2>
          <div class="mt-4 flex flex-col gap-3">
            <BaseButton :href="EXTERNAL_LINKS.payments" block>
              Pagar arriendo
            </BaseButton>
            <BaseButton :href="EXTERNAL_LINKS.clientArea" variant="ghost" block>
              Área de clientes
            </BaseButton>
          </div>
          <address class="mt-6 flex flex-col gap-1 text-sm text-muted not-italic">
            <span>{{ COMPANY.address }}</span>
            <span>{{ COMPANY.city }}</span>
            <a :href="COMPANY.phoneHref" data-numeric class="hover:text-ink">{{ COMPANY.phone }}</a>
            <a :href="`mailto:${COMPANY.email}`" class="hover:text-ink">{{ COMPANY.email }}</a>
            <a :href="`mailto:${COMPANY.maintenanceEmail}`" class="hover:text-ink">
              {{ COMPANY.maintenanceEmail }}
            </a>
          </address>
        </div>
      </div>

      <div class="mt-12 border-t border-line pt-8">
        <ul class="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          <li v-for="page in LEGAL_PAGES" :key="page.to">
            <NuxtLink :to="page.to" class="hover:text-ink">
              {{ page.label }}
            </NuxtLink>
          </li>
        </ul>

        <p class="mt-6 text-xs leading-relaxed text-muted">
          {{ COMPANY.legalName }} · NIT <span data-numeric>{{ COMPANY.nit }}</span><br>
          <!-- La línea de matrículas solo aparece cuando Inmobarco entregue los números (§15.3). -->
          <template v-if="RENTAL_REGISTRATIONS.length">
            Matrícula de arrendador:
            <span data-numeric>
              {{ RENTAL_REGISTRATIONS.map(r => `${r.city} ${r.number}`).join(' · ') }}
            </span><br>
          </template>
          © <span data-numeric>{{ year }}</span> {{ COMPANY.legalName }} Todos los derechos reservados.
        </p>
      </div>
    </div>
  </footer>
</template>
