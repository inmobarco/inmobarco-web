<script setup lang="ts">
import { CONTACT_SUBJECTS, contactSchema, emptyContactForm } from '#shared/schemas/forms'
import type { ContactResponse } from '../../../server/api/contact.post'

const props = withDefaults(defineProps<{
  /** Código del inmueble cuando se llega desde una ficha. */
  propertyCode?: string
}>(), { propertyCode: undefined })

const form = ref(emptyContactForm())
const errors = ref<Record<string, string>>({})
const state = ref<'idle' | 'sending' | 'sent' | 'failed'>('idle')
const failureMessage = ref('')

watchEffect(() => {
  form.value.propertyCode = props.propertyCode ?? ''
})

function validate(): boolean {
  const result = contactSchema.safeParse(form.value)
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
    // El foco va al primer campo con problema: sin esto, en móvil el error
    // puede quedar fuera de pantalla y parece que el botón no hace nada.
    await nextTick()
    document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    return
  }

  state.value = 'sending'
  try {
    await $fetch<ContactResponse>('/api/contact', {
      method: 'POST',
      body: form.value,
    })
    state.value = 'sent'
    form.value = emptyContactForm()
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
  <!-- Confirmación: reemplaza al formulario, no se añade debajo -->
  <div v-if="state === 'sent'" class="rounded-lg border border-success bg-success-bg p-6" role="status">
    <h2 class="text-xl">
      Tu mensaje fue enviado
    </h2>
    <p class="mt-3 text-muted">
      Te respondemos el siguiente día hábil. Si necesitas algo con más urgencia, escríbenos por
      WhatsApp y lo vemos de una vez.
    </p>
    <BaseButton class="mt-6" variant="ghost" @click="state = 'idle'">
      Enviar otro mensaje
    </BaseButton>
  </div>

  <form v-else class="flex flex-col gap-5" novalidate @submit.prevent="submit">
    <div class="grid gap-5 sm:grid-cols-2">
      <BaseInput
        v-model="form.name"
        label="Nombre"
        autocomplete="name"
        required
        :error="errors.name"
      />
      <BaseInput
        v-model="form.phone"
        label="Teléfono"
        type="tel"
        autocomplete="tel"
        required
        :error="errors.phone"
      />
    </div>

    <BaseInput
      v-model="form.email"
      label="Correo"
      type="email"
      autocomplete="email"
      required
      :error="errors.email"
    />

    <BaseSelect
      v-model="form.subject"
      label="¿En qué te ayudamos?"
      :options="CONTACT_SUBJECTS.map(item => ({ value: item.value, label: item.label }))"
      required
      :error="errors.subject"
    />

    <BaseInput
      v-if="form.propertyCode"
      v-model="form.propertyCode"
      label="Inmueble de interés"
      hint="Lo tomamos de la ficha que estabas viendo."
      :error="errors.propertyCode"
    />

    <BaseTextarea
      v-model="form.message"
      label="Mensaje"
      placeholder="Cuéntanos qué buscas: zona, presupuesto, número de habitaciones…"
      required
      :error="errors.message"
    />

    <!-- Trampa para bots: invisible y fuera del recorrido de teclado (§8.4) -->
    <BaseInput v-model="form.website" label="No llenes este campo" honeypot />

    <DataConsentCheckbox v-model="form.consent" :error="errors.consent" />

    <div
      v-if="state === 'failed'"
      class="rounded-md border border-error bg-error-bg p-4 text-sm"
      role="alert"
    >
      {{ failureMessage || 'No pudimos enviar tu mensaje.' }}
      Escríbenos por WhatsApp y lo resolvemos de una vez.
    </div>

    <div>
      <BaseButton type="submit" size="lg" :disabled="state === 'sending'">
        {{ state === 'sending' ? 'Enviando…' : 'Enviar mensaje' }}
      </BaseButton>
    </div>
  </form>
</template>
