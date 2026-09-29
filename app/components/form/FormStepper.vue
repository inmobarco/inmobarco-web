<script setup lang="ts">
const props = defineProps<{
  steps: string[]
  /** Paso actual, empezando en 1. */
  current: number
}>()

function stateOf(index: number): 'done' | 'current' | 'todo' {
  const step = index + 1
  if (step < props.current) return 'done'
  if (step === props.current) return 'current'
  return 'todo'
}
</script>

<template>
  <ol class="flex items-start">
    <li
      v-for="(step, index) in steps"
      :key="step"
      class="relative flex flex-1 flex-col items-center text-center"
      :aria-current="stateOf(index) === 'current' ? 'step' : undefined"
    >
      <!-- Une este paso con el anterior; el primero no lleva línea. -->
      <span
        v-if="index > 0"
        aria-hidden="true"
        class="absolute left-[-50%] top-[13px] h-[2px] w-full"
        :class="stateOf(index) === 'todo' ? 'bg-line' : 'bg-primary-600'"
      />

      <span
        class="relative z-10 flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 font-display text-xs font-bold"
        :class="{
          'border-primary-600 bg-primary-600 text-white': stateOf(index) === 'done',
          'border-ink bg-white text-ink': stateOf(index) === 'current',
          'border-line bg-white text-muted': stateOf(index) === 'todo',
        }"
      >
        <span class="sr-only">Paso {{ index + 1 }}:</span>
        <span aria-hidden="true">{{ stateOf(index) === 'done' ? '✓' : index + 1 }}</span>
      </span>

      <span
        class="mt-1.5 max-w-[9ch] text-[0.6875rem] leading-tight sm:max-w-[14ch]"
        :class="stateOf(index) === 'current' ? 'font-semibold text-ink' : 'text-muted'"
      >
        {{ step }}
      </span>
    </li>
  </ol>
</template>
