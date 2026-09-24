<script setup lang="ts">
const props = withDefaults(defineProps<{
  label: string
  hint?: string
  error?: string
  required?: boolean
  placeholder?: string
  rows?: number
}>(), {
  hint: undefined,
  error: undefined,
  placeholder: undefined,
  rows: 5,
})

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

    <textarea
      :id="id"
      v-model="model"
      :rows="rows"
      :required="required"
      :placeholder="placeholder"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="describedBy"
      class="rounded-sm border bg-white px-3.5 py-3 text-[0.9375rem] text-ink placeholder:text-neutral-400"
      :class="error ? 'border-error' : 'border-line'"
    />

    <p v-if="error" :id="errorId" class="text-xs text-error">
      {{ error }}
    </p>
    <p v-else-if="hint" :id="hintId" class="text-xs text-muted">
      {{ hint }}
    </p>
  </div>
</template>
