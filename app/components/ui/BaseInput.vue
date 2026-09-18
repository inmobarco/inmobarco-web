<script setup lang="ts">
const props = withDefaults(defineProps<{
  label: string
  type?: string
  hint?: string
  error?: string
  required?: boolean
  placeholder?: string
  autocomplete?: string
  /** Campo trampa para bots: se oculta y su contenido descarta el envío (§8.4). */
  honeypot?: boolean
}>(), {
  type: 'text',
  hint: undefined,
  error: undefined,
  placeholder: undefined,
  autocomplete: undefined,
})

const model = defineModel<string>({ default: '' })

const id = useId()
const hintId = computed(() => (props.hint ? `${id}-hint` : undefined))
const errorId = computed(() => (props.error ? `${id}-error` : undefined))
const describedBy = computed(() => [errorId.value, hintId.value].filter(Boolean).join(' ') || undefined)
</script>

<template>
  <div :class="honeypot ? 'sr-only' : 'flex flex-col gap-1.5'" :aria-hidden="honeypot || undefined">
    <label :for="id" class="text-xs font-semibold text-muted">
      {{ label }}
      <span v-if="required" aria-hidden="true">*</span>
    </label>

    <input
      :id="id"
      v-model="model"
      :type="type"
      :required="required && !honeypot"
      :placeholder="placeholder"
      :autocomplete="honeypot ? 'off' : autocomplete"
      :tabindex="honeypot ? -1 : undefined"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="describedBy"
      class="h-[46px] rounded-sm border bg-white px-3.5 text-[0.9375rem] text-ink placeholder:text-neutral-400"
      :class="error ? 'border-error' : 'border-line'"
    >

    <p v-if="error" :id="errorId" class="text-xs text-error">
      {{ error }}
    </p>
    <p v-else-if="hint" :id="hintId" class="text-xs text-muted">
      {{ hint }}
    </p>
  </div>
</template>
