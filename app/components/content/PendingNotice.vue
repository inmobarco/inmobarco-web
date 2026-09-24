<script setup lang="ts">
withDefaults(defineProps<{
  /** Qué falta, en una línea. */
  what?: string
  /**
   * `pending`: no hay texto todavía.
   * `draft`: el texto existe pero no lo ha revisado nadie con criterio jurídico.
   */
  tone?: 'pending' | 'draft'
}>(), {
  what: 'el contenido definitivo de esta página',
  tone: 'pending',
})
</script>

<template>
  <!--
    Marcador deliberadamente visible: si esta caja llega a producción, se nota a
    la primera. La página que lo muestra sale además `noindex` y queda fuera del
    sitemap, así que nunca entra al buscador con texto sin aprobar.
  -->
  <aside
    class="flex gap-3 rounded-md border p-4 text-sm text-neutral-800"
    :class="tone === 'draft' ? 'border-info bg-info-bg' : 'border-warning bg-warning-bg'"
    role="note"
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mt-0.5 flex-none" aria-hidden="true">
      <path v-if="tone === 'draft'" d="M12 16v-4M12 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      <path v-else d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    </svg>

    <p v-if="tone === 'draft'">
      <strong class="font-semibold">Borrador sin revisión jurídica.</strong>
      Este texto se redactó a partir de la Política de tratamiento de datos vigente de
      Inmobarco, pero falta {{ what }}. No se entrega a los buscadores ni habilita los
      formularios mientras siga así.
    </p>
    <p v-else>
      <strong class="font-semibold">Pendiente de Inmobarco.</strong>
      Falta {{ what }}. Lo que ves debajo es la estructura, no el texto final, y esta
      página no se entrega a los buscadores mientras siga así.
    </p>
  </aside>
</template>
