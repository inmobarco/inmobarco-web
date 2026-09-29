<script setup lang="ts">
const props = withDefaults(defineProps<{
  legend: string
  options: readonly { value: string, label: string }[]
  /** Nombre del grupo de radios. Irrelevante cuando `multiple` está activo. */
  name: string
  multiple?: boolean
  hint?: string
  error?: string
}>(), { multiple: false, hint: undefined, error: undefined })

/**
 * Debajo de cada pastilla hay un `input` de verdad, solo que oculto a la vista.
 * Así el grupo se recorre con teclado y lo anuncian los lectores de pantalla sin
 * que haya que reimplementar a mano el comportamiento de radios y casillas.
 */
const model = defineModel<string | string[]>({ required: true })

const selected = computed<string[]>(() =>
  Array.isArray(model.value) ? model.value : [model.value].filter(Boolean),
)

function isSelected(value: string): boolean {
  return selected.value.includes(value)
}

function toggle(value: string) {
  if (!props.multiple) {
    model.value = value
    return
  }
  model.value = isSelected(value)
    ? selected.value.filter(item => item !== value)
    : [...selected.value, value]
}

const id = useId()
const errorId = computed(() => (props.error ? `${id}-error` : undefined))
const hintId = computed(() => (props.hint ? `${id}-hint` : undefined))
const describedBy = computed(() => [errorId.value, hintId.value].filter(Boolean).join(' ') || undefined)
</script>

<template>
  <fieldset :aria-describedby="describedBy">
    <legend class="text-xs font-semibold text-muted">
      {{ legend }}
    </legend>

    <div class="mt-2 flex flex-wrap gap-2">
      <label
        v-for="option in options"
        :key="option.value"
        class="cursor-pointer rounded-sm border px-3.5 py-2 text-sm font-semibold transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-secondary"
        :class="isSelected(option.value)
          ? 'border-primary-600 bg-primary-50 text-primary-700'
          : 'border-line bg-white text-ink hover:border-primary-300'"
      >
        <input
          :type="multiple ? 'checkbox' : 'radio'"
          :name="name"
          :value="option.value"
          :checked="isSelected(option.value)"
          class="sr-only"
          @change="toggle(option.value)"
        >
        {{ option.label }}
      </label>
    </div>

    <p v-if="error" :id="errorId" class="mt-2 text-xs text-error">
      {{ error }}
    </p>
    <p v-else-if="hint" :id="hintId" class="mt-2 text-xs text-muted">
      {{ hint }}
    </p>
  </fieldset>
</template>
