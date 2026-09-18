<script setup lang="ts">
export interface SelectOption {
  value: string
  label: string
}

const props = defineProps<{
  label: string
  options: SelectOption[]
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
}>()

const model = defineModel<string>({ default: '' })

const id = useId()
const hintId = computed(() => (props.hint ? `${id}-hint` : undefined))
const errorId = computed(() => (props.error ? `${id}-error` : undefined))
const describedBy = computed(() => [errorId.value, hintId.value].filter(Boolean).join(' ') || undefined)
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label :for="id" class="text-xs font-semibold text-muted">
      {{ label }}
      <span v-if="required" aria-hidden="true">*</span>
    </label>

    <!-- `select` nativo a propósito: en móvil abre la rueda del sistema, que es
         más rápida y accesible que cualquier desplegable a medida. -->
    <select
      :id="id"
      v-model="model"
      :required="required"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="describedBy"
      class="h-[46px] appearance-none rounded-sm border bg-white bg-[length:16px] bg-[right_14px_center] bg-no-repeat px-3.5 pr-10 text-[0.9375rem] text-ink"
      :class="error ? 'border-error' : 'border-line'"
      style="background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239AA6AE' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E&quot;)"
    >
      <option v-if="placeholder" value="">
        {{ placeholder }}
      </option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>

    <p v-if="error" :id="errorId" class="text-xs text-error">
      {{ error }}
    </p>
    <p v-else-if="hint" :id="hintId" class="text-xs text-muted">
      {{ hint }}
    </p>
  </div>
</template>
