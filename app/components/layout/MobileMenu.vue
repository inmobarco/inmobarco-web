<script setup lang="ts">
import { EXTERNAL_LINKS } from '#shared/data/links'

defineProps<{ links: { label: string, to: string }[] }>()
const open = defineModel<boolean>('open', { default: false })

const panel = ref<HTMLElement | null>(null)
let lastFocused: HTMLElement | null = null

const FOCUSABLE = 'a[href], button:not([disabled])'

function focusables(): HTMLElement[] {
  return Array.from(panel.value?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
}

/** Mismo contrato que el modal: Esc cierra y Tab no se escapa al fondo (§10). */
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    open.value = false
    return
  }
  if (event.key !== 'Tab') return

  const items = focusables()
  if (!items.length) return

  const first = items[0]!
  const last = items[items.length - 1]!

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  }
  else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(open, async (isOpen) => {
  if (import.meta.server) return

  if (isOpen) {
    lastFocused = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    await nextTick()
    focusables()[0]?.focus()
  }
  else {
    document.body.style.overflow = ''
    lastFocused?.focus()
  }
})

// Cambiar de página con el menú abierto lo cierra.
const route = useRoute()
watch(() => route.fullPath, () => { open.value = false })

onBeforeUnmount(() => {
  if (import.meta.client) document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-100 bg-ink/60 lg:hidden" @click.self="open = false">
      <div
        ref="panel"
        role="dialog"
        aria-modal="true"
        aria-label="Menú principal"
        class="ml-auto flex h-full w-[min(88vw,340px)] flex-col overflow-y-auto bg-white p-6"
        @keydown="onKeydown"
      >
        <div class="flex items-center justify-between">
          <span class="font-display text-[1.3rem] font-bold tracking-[-0.03em]">inmobarco</span>
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-sm text-muted"
            aria-label="Cerrar menú"
            @click="open = false"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav class="mt-8 flex flex-col gap-1" aria-label="Principal">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="border-b border-line py-3 text-lg font-medium"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <div class="mt-8 flex flex-col gap-3">
          <BaseButton to="/propietarios" block>
            Consigna tu inmueble
          </BaseButton>
          <BaseButton :href="EXTERNAL_LINKS.payments" variant="ghost" block>
            Pagar arriendo
          </BaseButton>
          <BaseButton :href="EXTERNAL_LINKS.clientArea" variant="ghost" block>
            Área de clientes
          </BaseButton>
          <BaseButton to="/pqrs" variant="ghost" block>
            PQRS
          </BaseButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
