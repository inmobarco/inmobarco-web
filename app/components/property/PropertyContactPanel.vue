<script setup lang="ts">
import type { Property } from '#shared/types/property'
import { whatsappLink } from '#shared/data/links'
import { COMPANY } from '#shared/data/legal'

const props = defineProps<{ property: Property }>()

const { formatPrice } = useFormatters()

const whatsapp = computed(() => whatsappLink(props.property.code))

const priceLines = computed(() => {
  const lines: { label: string, value: string }[] = []
  if (props.property.price.rent) {
    lines.push({ label: 'Canon mensual', value: formatPrice(props.property.price.rent) })
  }
  if (props.property.price.sale) {
    lines.push({ label: 'Precio de venta', value: formatPrice(props.property.price.sale) })
  }
  return lines
})
</script>

<template>
  <!-- Panel lateral pegajoso del §7.3. En móvil se apila bajo la ficha. -->
  <aside class="lg:sticky lg:top-24">
    <div class="rounded-lg border border-line bg-white p-6 shadow-sm">
      <div v-for="line in priceLines" :key="line.label" class="mb-4">
        <p class="text-xs font-semibold text-muted">
          {{ line.label }}
        </p>
        <p data-numeric class="font-display text-[1.75rem] font-bold tracking-[-0.02em]">
          {{ line.value }}
        </p>
      </div>

      <p v-if="!priceLines.length" class="mb-4 text-lg font-semibold">
        Precio a consultar
      </p>

      <p class="text-sm text-muted">
        La cuota de administración no está incluida en este valor. Confírmala con nosotros antes
        de decidir.
      </p>

      <div class="mt-6 flex flex-col gap-3">
        <BaseButton :to="`/contacto?inmueble=${property.code}`" block>
          Agendar visita
        </BaseButton>
        <BaseButton :href="whatsapp" variant="ghost" block>
          Escribir por WhatsApp
        </BaseButton>
        <BaseButton :href="COMPANY.phoneHref" variant="ghost" block>
          Llamar {{ COMPANY.phone }}
        </BaseButton>
      </div>

      <p data-numeric class="mt-6 border-t border-line pt-4 text-center text-sm text-muted">
        Código del inmueble: <strong class="font-semibold text-ink">{{ property.code }}</strong>
      </p>
    </div>
  </aside>
</template>
