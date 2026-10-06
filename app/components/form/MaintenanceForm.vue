<script setup lang="ts">
import {
  ALL_UPLOAD_TYPES,
  emptyMaintenanceForm,
  findMaintenanceCategory,
  MAINTENANCE_CATEGORIES,
  MAINTENANCE_CLIENT_TYPES,
  MAINTENANCE_DAYS,
  MAINTENANCE_TIME_SLOTS,
  MAINTENANCE_UPLOAD,
  maintenanceSchema,
  uploadKindFor,
  type MaintenanceAttachment,
} from '#shared/schemas/forms'
import type { MaintenanceResponse } from '../../../server/api/maintenance/index.post'
import type { UploadUrlResponse } from '../../../server/api/maintenance/upload-url.post'

/**
 * Asistente por pasos para reportar una falla de mantenimiento.
 *
 * Va por pasos y no en una sola pantalla porque son diecisiete campos: pedirlos
 * de golpe desde un celular, que es desde donde se reporta una gotera, se
 * abandona. Cada paso valida **con el mismo esquema compartido** que usa el
 * servidor, filtrando los errores por los campos que le tocan: no hay una
 * segunda lista de reglas que se pueda desincronizar.
 */

const STEPS = ['Tus datos', 'La falla', 'Evidencia', 'Disponibilidad']

/** Qué campo se revisa en qué paso. El orden manda el foco al primer error. */
const STEP_FIELDS: string[][] = [
  ['name', 'documentNumber', 'email', 'phone', 'clientType', 'contractNumber', 'propertyAddress', 'unit', 'aptNum'],
  ['category', 'subcategory', 'description'],
  ['attachments'],
  ['availableDays', 'timeSlot', 'availabilityNotes', 'entryAuthorization', 'consent'],
]

const step = ref(1)
const form = ref(emptyMaintenanceForm())
const errors = ref<Record<string, string>>({})
const state = ref<'idle' | 'sending' | 'sent' | 'failed'>('idle')
const failureMessage = ref('')
const ticket = ref<string | null>(null)
const stepHeading = ref<HTMLElement | null>(null)

// --- Evidencia ---

interface Evidence {
  id: string
  name: string
  kind: 'image' | 'video'
  /** Tamaño que finalmente se sube: tras comprimir, no el del archivo elegido. */
  size: number
  contentType: string
  preview: string | null
  status: 'preparing' | 'uploading' | 'done' | 'failed'
  progress: number
  error: string
  key: string | null
}

const evidence = ref<Evidence[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const rejected = ref<string[]>([])

/**
 * Se apaga sola: si el endpoint de firma responde 503 es que todavía no hay
 * bucket configurado. El formulario lo dice y sigue sin adjuntos, en vez de
 * dejar al usuario atascado en un paso que no puede completar.
 */
const uploadsAvailable = ref(true)

const accept = ALL_UPLOAD_TYPES.join(',')

function liveCount(kind: 'image' | 'video'): number {
  return evidence.value.filter(item => item.kind === kind && item.status !== 'failed').length
}

const uploadsPending = computed(() =>
  evidence.value.some(item => item.status === 'preparing' || item.status === 'uploading'))

const attachments = computed<MaintenanceAttachment[]>(() =>
  evidence.value
    .filter((item): item is Evidence & { key: string } => item.status === 'done' && item.key !== null)
    .map(item => ({ key: item.key, name: item.name, contentType: item.contentType, size: item.size })))

function statusCodeOf(error: unknown): number | null {
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const code = (error as { statusCode?: unknown }).statusCode
    if (typeof code === 'number') return code
  }
  return null
}

function messageOf(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'statusMessage' in error) {
    const message = (error as { statusMessage?: unknown }).statusMessage
    if (typeof message === 'string' && message) return message
  }
  return error instanceof Error ? error.message : fallback
}

function pickFiles() {
  fileInput.value?.click()
}

function onFilesChosen(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) addFiles(Array.from(input.files))
  // Permite volver a elegir el mismo archivo si el usuario lo quitó y se arrepintió.
  input.value = ''
}

function addFiles(files: File[]) {
  rejected.value = []

  for (const file of files) {
    const kind = uploadKindFor(file.type)

    if (!kind) {
      rejected.value.push(file.name + ': formato no admitido.')
      continue
    }

    const limits = MAINTENANCE_UPLOAD[kind]

    if (liveCount(kind) >= limits.maxFiles) {
      rejected.value.push(kind === 'image'
        ? file.name + ': ya alcanzaste el máximo de ' + limits.maxFiles + ' fotos.'
        : file.name + ': solo se puede adjuntar ' + limits.maxFiles + ' video.')
      continue
    }

    if (file.size > limits.maxBytes) {
      rejected.value.push(
        file.name + ': pesa ' + formatBytes(file.size) + ' y el máximo es ' + formatBytes(limits.maxBytes) + '.',
      )
      continue
    }

    /**
     * `reactive` y no un objeto normal: `process()` muta esta entrada desde una
     * promesa —progreso, estado, clave— y `push` guarda el objeto **en bruto**.
     * Mutar el objeto en bruto cambia el dato pero no dispara nada, así que la
     * tarjeta se quedaba clavada en «Preparando…» con el archivo ya subido, y
     * `uploadsPending` nunca volvía a calcularse: el botón de enviar se quedaba
     * bloqueado para siempre.
     */
    const entry: Evidence = reactive({
      id: Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      name: file.name,
      kind,
      size: file.size,
      contentType: file.type,
      preview: kind === 'image' ? URL.createObjectURL(file) : null,
      status: 'preparing',
      progress: 0,
      error: '',
      key: null,
    })

    evidence.value.push(entry)
    void process(entry, file)
  }
}

async function process(entry: Evidence, file: File) {
  try {
    const prepared = entry.kind === 'image'
      ? await compressImage(file)
      : { blob: file as Blob, contentType: file.type }

    const { key, url } = await $fetch<UploadUrlResponse>('/api/maintenance/upload-url', {
      method: 'POST',
      body: {
        submissionId: form.value.submissionId,
        contentType: prepared.contentType,
        size: prepared.blob.size,
      },
    })

    entry.status = 'uploading'
    await uploadWithProgress(url, prepared.blob, prepared.contentType, (ratio) => {
      entry.progress = ratio
    })

    entry.key = key
    entry.contentType = prepared.contentType
    entry.size = prepared.blob.size
    entry.progress = 1
    entry.status = 'done'
  }
  catch (error) {
    if (statusCodeOf(error) === 503) {
      uploadsAvailable.value = false
      removeEvidence(entry.id)
      return
    }
    entry.status = 'failed'
    entry.error = messageOf(error, 'No se pudo subir')
  }
}

function removeEvidence(id: string) {
  const index = evidence.value.findIndex(item => item.id === id)
  if (index < 0) return

  const [removed] = evidence.value.splice(index, 1)
  if (removed?.preview) URL.revokeObjectURL(removed.preview)

  /**
   * No se borra el objeto de R2. Quitar un adjunto del formulario es frecuente y
   * borrarlo de verdad exigiría otro endpoint firmado —otra superficie que
   * proteger— para un archivo que nadie va a leer nunca. Lo recoge la regla de
   * ciclo de vida del bucket.
   */
}

onBeforeUnmount(() => {
  for (const item of evidence.value) {
    if (item.preview) URL.revokeObjectURL(item.preview)
  }
})

// --- Pasos ---

function issuesFor(fields: string[]): Record<string, string> {
  const result = maintenanceSchema.safeParse({ ...form.value, attachments: attachments.value })
  if (result.success) return {}

  const found: Record<string, string> = {}
  for (const field of fields) {
    const issue = result.error.issues.find(item => String(item.path[0] ?? '') === field)
    if (issue) found[field] = issue.message
  }
  return found
}

async function focusFirstError() {
  await nextTick()
  document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
}

async function goTo(next: number) {
  step.value = next
  errors.value = {}
  await nextTick()
  stepHeading.value?.focus()
}

async function forward() {
  const found = issuesFor(STEP_FIELDS[step.value - 1] ?? [])

  /**
   * Al menos una evidencia, pero solo mientras los adjuntos estén habilitados:
   * si R2 no está configurado, exigirla dejaría a todos sin poder reportar.
   */
  if (step.value === 3 && uploadsAvailable.value && attachments.value.length === 0) {
    found.attachments = uploadsPending.value
      ? 'Espera a que termine de subir el archivo'
      : 'Adjunta al menos una foto o un video de la falla'
  }

  errors.value = found

  if (Object.keys(found).length > 0) {
    await focusFirstError()
    return
  }

  if (step.value < STEPS.length) {
    await goTo(step.value + 1)
    return
  }

  await submit()
}

function back() {
  if (step.value > 1) void goTo(step.value - 1)
}

async function submit() {
  if (state.value === 'sending' || uploadsPending.value) return

  state.value = 'sending'
  try {
    const response = await $fetch<MaintenanceResponse>('/api/maintenance', {
      method: 'POST',
      body: { ...form.value, attachments: attachments.value },
    })
    ticket.value = response.ticket
    state.value = 'sent'
  }
  catch (error) {
    failureMessage.value = messageOf(error, '')
    state.value = 'failed'
  }
}

function restart() {
  for (const item of evidence.value) {
    if (item.preview) URL.revokeObjectURL(item.preview)
  }
  evidence.value = []
  rejected.value = []
  form.value = emptyMaintenanceForm()
  ticket.value = null
  failureMessage.value = ''
  state.value = 'idle'
  void goTo(1)
}

// --- Datos derivados de la taxonomía ---

const subcategories = computed(() => {
  const category = findMaintenanceCategory(form.value.category)
  if (!category || category.subcategories.length === 0) return []
  return category.subcategories.map(item => ({ value: item.value, label: item.label }))
})

const isTenant = computed(() => form.value.clientType === 'arrendatario')

function chooseCategory(value: string) {
  form.value.category = value
  form.value.subcategory = ''
}

function progressLabel(item: Evidence): string {
  if (item.status === 'preparing') return 'Preparando…'
  return 'Subiendo… ' + Math.round(item.progress * 100) + '%'
}
</script>

<template>
  <!-- Confirmación: reemplaza al formulario, no se añade debajo. -->
  <div v-if="state === 'sent'" class="rounded-lg border border-success bg-success-bg p-6 md:p-8" role="status">
    <h2 class="text-xl">
      Recibimos tu solicitud
    </h2>

    <template v-if="ticket">
      <p class="mt-3 text-muted">
        Este es el número con el que puedes hacerle seguimiento:
      </p>
      <p class="mt-2 font-display text-2xl font-bold" data-numeric>
        {{ ticket }}
      </p>
      <p class="mt-2 text-sm text-muted">
        También te lo enviamos al correo que nos dejaste.
      </p>
    </template>

    <p v-else class="mt-3 text-muted">
      Tu reporte quedó registrado. Te enviamos el número de radicado al correo que nos dejaste,
      junto con el resumen de lo que reportaste.
    </p>

    <BaseButton class="mt-6" variant="ghost" @click="restart">
      Reportar otra falla
    </BaseButton>
  </div>

  <div v-else>
    <FormStepper :steps="STEPS" :current="step" />

    <form class="mt-8" novalidate @submit.prevent="forward">
      <!-- PASO 1 -->
      <section v-if="step === 1">
        <h2 ref="stepHeading" tabindex="-1" class="text-lg">
          Tus datos y el inmueble
        </h2>
        <p class="mt-2 text-sm text-muted">
          Para saber quién reporta, dónde hay que atender y por dónde te respondemos.
        </p>

        <div class="mt-6 flex flex-col gap-5">
          <div class="grid gap-5 sm:grid-cols-2">
            <BaseInput v-model="form.name" label="Nombre completo" autocomplete="name" required :error="errors.name" />
            <BaseInput
              v-model="form.documentNumber"
              label="Número de documento"
              inputmode="numeric"
              required
              :error="errors.documentNumber"
            />
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <BaseInput v-model="form.email" label="Correo" type="email" autocomplete="email" required :error="errors.email" />
            <BaseInput v-model="form.phone" label="Teléfono" type="tel" autocomplete="tel" required :error="errors.phone" />
          </div>

          <ChoiceChips
            v-model="form.clientType"
            legend="¿Cómo te relacionas con el inmueble?"
            name="clientType"
            :options="MAINTENANCE_CLIENT_TYPES"
            :error="errors.clientType"
          />

          <!--
            El número de contrato es lo que deja archivar la evidencia por
            inmueble. Se pide al arrendatario y no al propietario, que puede
            estar reportando sobre un inmueble desocupado.
          -->
          <BaseInput
            v-model="form.contractNumber"
            :label="isTenant ? 'Número de contrato' : 'Número de contrato (si el inmueble está arrendado)'"
            placeholder="843A"
            :required="isTenant"
            hint="Aparece en el encabezado de tu contrato de arrendamiento."
            :error="errors.contractNumber"
          />

          <BaseInput
            v-model="form.propertyAddress"
            label="Dirección del inmueble"
            autocomplete="street-address"
            placeholder="Carrera 43A #5 Sur - 20"
            required
            :error="errors.propertyAddress"
          />

          <div class="grid gap-5 sm:grid-cols-2">
            <BaseInput v-model="form.unit" label="Unidad o conjunto residencial" hint="Si aplica." :error="errors.unit" />
            <BaseInput v-model="form.aptNum" label="Apartamento o interior" hint="Si aplica." :error="errors.aptNum" />
          </div>
        </div>
      </section>

      <!-- PASO 2 -->
      <section v-else-if="step === 2">
        <h2 ref="stepHeading" tabindex="-1" class="text-lg">
          ¿Cuál es la falla?
        </h2>
        <p class="mt-2 text-sm text-muted">
          Elige la categoría que más se parezca. Si ninguna encaja, marca «Otros» y explícalo abajo.
        </p>

        <div class="mt-6 flex flex-col gap-5">
          <fieldset>
            <legend class="text-xs font-semibold text-muted">
              Categoría
            </legend>
            <div class="mt-2 grid gap-2.5 sm:grid-cols-2">
              <label
                v-for="category in MAINTENANCE_CATEGORIES"
                :key="category.value"
                class="cursor-pointer rounded-sm border px-4 py-3 text-sm font-bold has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-secondary"
                :class="form.category === category.value
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-line bg-white text-ink hover:border-primary-300'"
              >
                <input
                  type="radio"
                  name="category"
                  :value="category.value"
                  :checked="form.category === category.value"
                  :aria-invalid="errors.category ? true : undefined"
                  class="sr-only"
                  @change="chooseCategory(category.value)"
                >
                {{ category.label }}
              </label>
            </div>
            <p v-if="errors.category" class="mt-2 text-xs text-error">
              {{ errors.category }}
            </p>
          </fieldset>

          <BaseSelect
            v-if="subcategories.length > 0"
            v-model="form.subcategory"
            label="¿Qué es exactamente?"
            placeholder="Elige una opción"
            :options="subcategories"
            required
            :error="errors.subcategory"
          />

          <BaseTextarea
            v-model="form.description"
            label="Cuéntanos qué está pasando"
            placeholder="Desde cuándo ocurre, en qué parte del inmueble y cualquier detalle que le ayude al técnico a llegar preparado."
            :rows="5"
            :error="errors.description"
          />
        </div>
      </section>

      <!-- PASO 3 -->
      <section v-else-if="step === 3">
        <h2 ref="stepHeading" tabindex="-1" class="text-lg">
          Adjunta fotos o un video
        </h2>
        <p class="mt-2 text-sm text-muted">
          Necesitamos al menos una. Con una foto el técnico llega sabiendo qué va a encontrar y
          casi siempre se resuelve en una sola visita.
        </p>

        <div v-if="!uploadsAvailable" class="mt-6 rounded-md border border-warning bg-warning-bg p-4 text-sm">
          Los adjuntos todavía no están habilitados en el sitio. Continúa con el reporte y, si
          hacen falta fotos, te las pedimos por WhatsApp al confirmarte el radicado.
        </div>

        <template v-else>
          <button
            type="button"
            class="mt-6 w-full rounded-md border border-dashed bg-surface px-6 py-8 text-center hover:border-primary-400"
            :class="errors.attachments ? 'border-error' : 'border-line'"
            :aria-invalid="errors.attachments ? true : undefined"
            :aria-describedby="errors.attachments ? 'attachments-error' : undefined"
            @click="pickFiles"
          >
            <span class="block font-semibold text-ink">Elegir archivos</span>
            <span class="mt-1 block text-xs text-muted">
              Hasta {{ MAINTENANCE_UPLOAD.image.maxFiles }} fotos y {{ MAINTENANCE_UPLOAD.video.maxFiles }} video
              de máximo {{ formatBytes(MAINTENANCE_UPLOAD.video.maxBytes) }}
            </span>
          </button>

          <p v-if="errors.attachments" id="attachments-error" class="mt-2 text-xs text-error">
            {{ errors.attachments }}
          </p>

          <input
            ref="fileInput"
            type="file"
            :accept="accept"
            multiple
            class="sr-only"
            tabindex="-1"
            aria-hidden="true"
            @change="onFilesChosen"
          >

          <ul v-if="rejected.length > 0" class="mt-4 rounded-md border border-error bg-error-bg p-4 text-sm" role="alert">
            <li v-for="reason in rejected" :key="reason">
              {{ reason }}
            </li>
          </ul>

          <ul v-if="evidence.length > 0" class="mt-5 flex flex-col gap-2.5">
            <li
              v-for="item in evidence"
              :key="item.id"
              class="flex items-center gap-3 rounded-sm border border-line p-2.5"
            >
              <img
                v-if="item.preview"
                :src="item.preview"
                alt=""
                class="h-11 w-11 flex-none rounded-sm object-cover"
              >
              <span
                v-else
                aria-hidden="true"
                class="flex h-11 w-11 flex-none items-center justify-center rounded-sm bg-ink text-sm text-white"
              >&#9654;</span>

              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-medium">{{ item.name }}</span>

                <span v-if="item.status === 'done'" class="text-xs text-success">
                  Subido &middot; {{ formatBytes(item.size) }}
                </span>
                <span v-else-if="item.status === 'failed'" class="text-xs text-error">
                  {{ item.error }}
                </span>
                <span v-else class="mt-1 block">
                  <span class="block h-1 w-full overflow-hidden rounded-full bg-neutral-100">
                    <span
                      class="block h-full bg-primary-600"
                      :style="{ width: Math.round(item.progress * 100) + '%' }"
                    />
                  </span>
                  <span class="mt-1 block text-xs text-muted">{{ progressLabel(item) }}</span>
                </span>
              </span>

              <button
                type="button"
                class="flex-none rounded-sm px-2 py-1 text-sm font-semibold text-error"
                @click="removeEvidence(item.id)"
              >
                Quitar<span class="sr-only"> {{ item.name }}</span>
              </button>
            </li>
          </ul>
        </template>
      </section>

      <!-- PASO 4 -->
      <section v-else-if="step === 4">
        <h2 ref="stepHeading" tabindex="-1" class="text-lg">
          ¿Cuándo podemos ir?
        </h2>
        <p class="mt-2 text-sm text-muted">
          Coordinamos la visita dentro de la disponibilidad que nos indiques.
        </p>

        <div class="mt-6 flex flex-col gap-5">
          <ChoiceChips
            v-model="form.availableDays"
            legend="Días en los que puedes atender"
            name="availableDays"
            multiple
            :options="MAINTENANCE_DAYS"
            hint="Puedes marcar varios."
            :error="errors.availableDays"
          />

          <ChoiceChips
            v-model="form.timeSlot"
            legend="Franja que te conviene"
            name="timeSlot"
            :options="MAINTENANCE_TIME_SLOTS"
            :error="errors.timeSlot"
          />

          <BaseTextarea
            v-model="form.availabilityNotes"
            label="Algo más que debamos saber"
            placeholder="Por ejemplo: portería debe anunciar, hay mascota, después de las 3 p. m."
            :rows="3"
            :error="errors.availabilityNotes"
          />

          <!-- Trampa para bots: invisible y fuera del recorrido de teclado (§8.4) -->
          <BaseInput v-model="form.website" label="No llenes este campo" honeypot />

          <div class="flex flex-col gap-4 rounded-md border border-line bg-surface p-4">
            <div>
              <div class="flex items-start gap-3">
                <input
                  id="entry-authorization"
                  v-model="form.entryAuthorization"
                  type="checkbox"
                  :aria-invalid="errors.entryAuthorization ? true : undefined"
                  class="mt-1 h-[18px] w-[18px] flex-none rounded-[3px] border border-line accent-primary-600"
                >
                <label for="entry-authorization" class="text-sm text-muted">
                  Autorizo el ingreso del personal de mantenimiento al inmueble dentro del horario
                  que indiqué, para revisar y atender esta solicitud.
                </label>
              </div>
              <p v-if="errors.entryAuthorization" class="mt-2 text-xs text-error">
                {{ errors.entryAuthorization }}
              </p>
            </div>

            <!--
              Dos autorizaciones separadas a propósito: una cubre el tratamiento de
              datos personales (Ley 1581) y la otra la entrada de un desconocido a
              la casa. Fundirlas en una sola casilla no dejaría constancia de ninguna.
            -->
            <DataConsentCheckbox v-model="form.consent" :error="errors.consent" />
          </div>
        </div>
      </section>

      <div v-if="state === 'failed'" class="mt-6 rounded-md border border-error bg-error-bg p-4 text-sm" role="alert">
        {{ failureMessage || 'No pudimos registrar tu solicitud.' }}
        Vuelve a intentarlo o escríbenos por WhatsApp y lo resolvemos de una vez.
      </div>

      <p v-if="uploadsPending" class="mt-6 text-sm text-muted" role="status">
        Espera a que terminen de subir los archivos para enviar el reporte.
      </p>

      <div class="mt-8 flex items-center justify-between gap-3">
        <BaseButton v-if="step > 1" variant="ghost" type="button" @click="back">
          Atrás
        </BaseButton>
        <span v-else />

        <BaseButton type="submit" size="lg" :disabled="state === 'sending' || uploadsPending">
          <template v-if="step < STEPS.length">
            Siguiente
          </template>
          <template v-else>
            {{ state === 'sending' ? 'Enviando…' : 'Enviar el reporte' }}
          </template>
        </BaseButton>
      </div>
    </form>
  </div>
</template>
