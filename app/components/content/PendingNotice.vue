<script setup lang="ts">
withDefaults(defineProps<{
  /** Qué falta, en una línea. */
  what?: string
}>(), { what: 'el contenido definitivo de esta página' })
</script>

<template>
  <!--
    Marcador de contenido pendiente. Es deliberadamente visible: si esta caja
    llega a producción, se nota a la primera. La página que lo muestra sale
    además `noindex`, así que nunca entra al buscador con texto de relleno.
  -->
  <aside
    class="flex gap-3 rounded-md border border-warning bg-warning-bg p-4 text-sm text-neutral-800"
    role="note"
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mt-0.5 flex-none" aria-hidden="true">
      <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    </svg>
    <p>
      <strong class="font-semibold">Pendiente de Inmobarco.</strong>
      Falta {{ what }}. Lo que ves debajo es la estructura, no el texto final, y esta
      página no se entrega a los buscadores mientras siga así.
    </p>
  </aside>
</template>
