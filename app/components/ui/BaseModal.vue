<script setup lang="ts">
const props = defineProps<{ title: string }>()
const open = defineModel<boolean>('open', { default: false })

const panel = ref<HTMLElement | null>(null)
let lastFocused: HTMLElement | null = null

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function focusables(): HTMLElement[] {
  return Array.from(panel.value?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
}

/** Trampa de foco: dentro del modal, Tab nunca sale al fondo (§10). */
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    open.value = false
    return
  }
  if (event.key !== 'Tab') return

  const items = focusables()
  if (!items.length) {
    event.preventDefault()
    return
  }

  const first = items[0]!
  const last = items[items.length - 1]!
  const active = document.activeElement

  if (event.shiftKey && (active === first || active === panel.value)) {
    event.preventDefault()
    last.focus()
  }
  else if (!event.shiftKey && active === last) {
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
    ;(focusables()[0] ?? panel.value)?.focus()
  }
  else {
    document.body.style.overflow = ''
    lastFocused?.focus()
  }
})

onBeforeUnmount(() => {
  if (import.meta.client) document.body.style.overflow = ''
})

const titleId = useId()
defineExpose({ title: props.title })
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-100 flex items-end justify-center bg-ink/60 md:items-center"
      @click.self="open = false"
    >
      <div
        ref="panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
        class="max-h-[90dvh] w-full overflow-y-auto rounded-t-lg bg-white p-6 md:max-w-lg md:rounded-lg"
        @keydown="onKeydown"
      >
        <div class="flex items-start justify-between gap-4">
          <h2 :id="titleId" class="text-xl">
            {{ title }}
          </h2>
          <button
            type="button"
            class="-mt-1 -mr-1 flex h-10 w-10 items-center justify-center rounded-sm text-muted"
            aria-label="Cerrar"
            @click="open = false"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div class="mt-4">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>
