<script setup lang="ts">
import { CONSIGN_OPERATIONS, consignSchema, emptyConsignForm } from '#shared/schemas/forms'
import { PROPERTY_TYPES, ZONES } from '#shared/data/taxonomy'
import type { ConsignResponse } from '../../../server/api/consign.post'

const form = ref(emptyConsignForm())
const errors = ref<Record<string, string>>({})
const state = ref<'idle' | 'sending' | 'sent' | 'failed'>('idle')
const failureMessage = ref('')

/** El propietario puede tener algo que no esté en la taxonomía del inventario. */
const typeOptions = computed(() => [
  ...PROPERTY_TYPES.map(type => ({ value: type.slug, label: type.name })),
  { value: 'otro', label: 'Otro' },
])

const zoneOptions = computed(() => [
  ...ZONES.map(zone => ({ value: zone.slug, label: zone.name })),
  { value: 'otro', label: 'Otro municipio' },
])

function validate(): boolean {
  const result = consignSchema.safeParse(form.value)
  if (result.success) {
    errors.value = {}
    return true
  }

  const next: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? '')
    if (field && !next[field]) next[field] = issue.message
  }
  errors.value = next
  return false
}

async function submit() {
  if (state.value === 'sending') return
  if (!validate()) {
    await nextTick()
    document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    return
  }

  state.value = 'sending'
  try {
    await $fetch<ConsignResponse>('/api/consign', { method: 'POST', body: form.value })
    state.value = 'sent'
    form.value = emptyConsignForm()
  }
  catch (error) {
    failureMessage.value = error instanceof Error && 'statusMessage' in error
      ? String((error as { statusMessage?: string }).statusMessage ?? '')
      : ''
    state.value = 'failed'
  }
}
</script>

<template>
  <div v-if="state === 'sent'" class="rounded-lg border border-success bg-success-bg p-6" role="status">
    <h2 class="text-xl">
      Recibimos tu inmueble
    </h2>
    <p class="mt-3 text-muted">
      Un asesor te contacta el siguiente día hábil para coordinar la visita de avalúo y contarte
      las condiciones de la administración.
    </p>
    <BaseButton class="mt-6" variant="ghost" @click="state = 'idle'">
      Registrar otro inmueble
    </BaseButton>
  </div>

  <form v-else class="flex flex-col gap-5" novalidate @submit.prevent="submit">
    <div class="grid gap-5 sm:grid-cols-2">
      <BaseInput v-model="form.name" label="Nombre" autocomplete="name" required :error="errors.name" />
      <BaseInput v-model="form.phone" label="Teléfono" type="tel" autocomplete="tel" required :error="errors.phone" />
    </div>

    <BaseInput v-model="form.email" label="Correo" type="email" autocomplete="email" required :error="errors.email" />

    <BaseSelect
      v-model="form.operation"
      label="¿Qué quieres hacer con el inmueble?"
      :options="CONSIGN_OPERATIONS.map(item => ({ value: item.value, label: item.label }))"
      required
      :error="errors.operation"
    />

    <div class="grid gap-5 sm:grid-cols-2">
      <BaseSelect
        v-model="form.propertyType"
        label="Tipo de inmueble"
        placeholder="Elige una opción"
        :options="typeOptions"
        required
        :error="errors.propertyType"
      />
      <BaseSelect
        v-model="form.zone"
        label="Municipio"
        placeholder="Elige una opción"
        :options="zoneOptions"
        required
        :error="errors.zone"
      />
    </div>

    <BaseInput
      v-model="form.expectedPrice"
      label="Canon o precio esperado"
      type="text"
      inputmode="numeric"
      hint="Opcional. Si no lo tienes claro, lo definimos contigo en el avalúo."
      :error="errors.expectedPrice"
    />

    <BaseTextarea
      v-model="form.message"
      label="Cuéntanos del inmueble"
      placeholder="Barrio, área aproximada, número de habitaciones, si está ocupado…"
      :rows="4"
      :error="errors.message"
    />

    <!-- Trampa para bots: invisible y fuera del recorrido de teclado (§8.4) -->
    <BaseInput v-model="form.website" label="No llenes este campo" honeypot />

    <DataConsentCheckbox v-model="form.consent" :error="errors.consent" />

    <div v-if="state === 'failed'" class="rounded-md border border-error bg-error-bg p-4 text-sm" role="alert">
      {{ failureMessage || 'No pudimos enviar tus datos.' }}
      Escríbenos por WhatsApp y lo resolvemos de una vez.
    </div>

    <div>
      <BaseButton type="submit" size="lg" :disabled="state === 'sending'">
        {{ state === 'sending' ? 'Enviando…' : 'Quiero que administren mi inmueble' }}
      </BaseButton>
    </div>
  </form>
</template>
