<script setup lang="ts">
type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'error'

withDefaults(defineProps<{ tone?: Tone }>(), { tone: 'neutral' })

const toneClass: Record<Tone, string> = {
  neutral: 'bg-neutral-100 text-neutral-800',
  primary: 'bg-primary-100 text-primary-900',
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-neutral-800',
  error: 'bg-error-bg text-error',
}
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
    :class="toneClass[tone]"
  >
    <slot />
  </span>
</template>
