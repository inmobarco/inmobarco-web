<script setup lang="ts">
import { whatsappLink } from '#shared/data/links'

/** Con el código del inmueble, la conversación llega identificada a n8n (§14). */
const props = defineProps<{ code?: string }>()
const href = computed(() => whatsappLink(props.code))
</script>

<template>
  <a
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="fixed right-4 bottom-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-ink shadow-lg transition-colors hover:bg-primary-300 md:right-6 md:bottom-6"
  >
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.17c-.25.69-1.43 1.32-1.97 1.37-.53.05-1.02.24-3.44-.72-2.89-1.14-4.73-4.07-4.87-4.26-.14-.19-1.16-1.55-1.16-2.95s.73-2.09.99-2.38c.26-.29.57-.36.76-.36l.54.01c.17 0 .41-.07.64.49.24.57.8 1.97.87 2.11.07.14.12.31.02.5-.1.19-.14.31-.29.48-.14.17-.3.37-.43.5-.14.14-.29.29-.12.57.17.29.74 1.22 1.59 1.98 1.09.97 2.01 1.27 2.3 1.41.29.14.45.12.62-.07.17-.19.72-.84.91-1.13.19-.29.38-.24.64-.14.26.09 1.66.78 1.94.93.29.14.48.21.55.33.07.12.07.69-.19 1.38z" />
    </svg>
    <span class="sr-only">Escribir por WhatsApp (abre en una nueva pestaña)</span>
  </a>
</template>
