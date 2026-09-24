<script setup lang="ts">
const props = withDefaults(defineProps<{ error?: string }>(), { error: undefined })

/** Nace sin marcar, siempre. No se precarga ni se recuerda (§8.2, CERRADO). */
const model = defineModel<boolean>({ default: false })

const id = useId()
const errorId = computed(() => (props.error ? `${id}-error` : undefined))
</script>

<template>
  <div>
    <div class="flex items-start gap-3">
      <input
        :id="id"
        v-model="model"
        type="checkbox"
        required
        :aria-invalid="error ? true : undefined"
        :aria-describedby="errorId"
        class="mt-1 h-[18px] w-[18px] flex-none rounded-[3px] border border-line accent-primary-600"
      >
      <label :for="id" class="text-sm text-muted">
        Autorizo el tratamiento de mis datos personales conforme a la
        <NuxtLink
          to="/legal/tratamiento-de-datos"
          class="font-semibold text-primary-700 underline decoration-primary-200 decoration-2 underline-offset-4 hover:decoration-primary-700"
        >
          Política de Tratamiento de Datos
        </NuxtLink>
        de Inmobarco Inmobiliaria S.A.S.
      </label>
    </div>

    <p v-if="error" :id="errorId" class="mt-2 text-xs text-error">
      {{ error }}
    </p>
  </div>
</template>
