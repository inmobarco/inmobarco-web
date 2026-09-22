<script setup lang="ts">
import type { PropertyImage } from '#shared/types/property'

const props = defineProps<{
  images: PropertyImage[]
  title: string
}>()

const current = ref(0)
const lightboxOpen = ref(false)
const lightbox = ref<HTMLElement | null>(null)
let lastFocused: HTMLElement | null = null

const hasImages = computed(() => props.images.length > 0)
const currentImage = computed(() => props.images[current.value])

/** Cuatro miniaturas bajo la foto grande; el resto entra por el botón de "ver todas". */
const thumbnails = computed(() => props.images.slice(0, 5))
const remaining = computed(() => Math.max(0, props.images.length - thumbnails.value.length))

function show(index: number) {
  const total = props.images.length
  if (!total) return
  current.value = (index + total) % total
}

function openLightbox(index: number) {
  show(index)
  lightboxOpen.value = true
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    lightboxOpen.value = false
    return
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    show(current.value + 1)
    return
  }
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    show(current.value - 1)
    return
  }
  // Trampa de foco: dentro del lightbox el tabulador no sale al fondo (§10).
  if (event.key === 'Tab') {
    const items = Array.from(lightbox.value?.querySelectorAll<HTMLElement>('button') ?? [])
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
}

watch(lightboxOpen, async (open) => {
  if (import.meta.server) return
  if (open) {
    lastFocused = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    await nextTick()
    lightbox.value?.querySelector('button')?.focus()
  }
  else {
    document.body.style.overflow = ''
    lastFocused?.focus()
  }
})

onBeforeUnmount(() => {
  if (import.meta.client) document.body.style.overflow = ''
})
</script>

<template>
  <section aria-label="Fotos del inmueble">
    <div v-if="!hasImages" class="flex aspect-16/10 items-center justify-center rounded-lg bg-surface text-muted">
      Este inmueble todavía no tiene fotos publicadas
    </div>

    <template v-else>
      <button
        type="button"
        class="block w-full overflow-hidden rounded-lg"
        @click="openLightbox(current)"
      >
        <NuxtImg
          :src="currentImage!.url"
          :alt="currentImage!.alt"
          width="1120"
          height="700"
          sizes="sm:100vw md:100vw lg:66vw"
          preload
          fetchpriority="high"
          class="aspect-16/10 w-full object-cover"
        />
        <span class="sr-only">Ampliar foto</span>
      </button>

      <ul class="mt-3 grid grid-cols-5 gap-3">
        <li v-for="(image, index) in thumbnails" :key="image.url">
          <button
            type="button"
            class="block w-full overflow-hidden rounded-sm border-2"
            :class="index === current ? 'border-ink' : 'border-transparent'"
            :aria-current="index === current ? 'true' : undefined"
            @click="index === thumbnails.length - 1 && remaining ? openLightbox(index) : show(index)"
          >
            <span class="relative block">
              <NuxtImg
                :src="image.url"
                :alt="image.alt"
                width="200"
                height="150"
                loading="lazy"
                class="aspect-4/3 w-full object-cover"
              />
              <span
                v-if="index === thumbnails.length - 1 && remaining"
                class="absolute inset-0 flex items-center justify-center bg-ink/70 text-sm font-semibold text-white"
              >
                +{{ remaining }}
              </span>
            </span>
            <span class="sr-only">Foto {{ index + 1 }} de {{ images.length }}</span>
          </button>
        </li>
      </ul>
    </template>

    <Teleport to="body">
      <div
        v-if="lightboxOpen"
        ref="lightbox"
        class="fixed inset-0 z-100 flex flex-col bg-ink/95"
        role="dialog"
        aria-modal="true"
        :aria-label="`Fotos de ${title}`"
        @keydown="onKeydown"
      >
        <div class="flex items-center justify-between p-4 text-white">
          <p data-numeric class="text-sm">
            {{ current + 1 }} de {{ images.length }}
          </p>
          <button
            type="button"
            class="flex h-11 w-11 items-center justify-center rounded-sm text-white"
            aria-label="Cerrar galería"
            @click="lightboxOpen = false"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div class="flex flex-1 items-center justify-between gap-2 px-2 pb-6">
          <button
            type="button"
            class="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Foto anterior"
            @click="show(current - 1)"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>

          <NuxtImg
            :src="currentImage!.url"
            :alt="currentImage!.alt"
            width="1400"
            height="1050"
            class="max-h-full min-w-0 flex-1 object-contain"
          />

          <button
            type="button"
            class="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Foto siguiente"
            @click="show(current + 1)"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </Teleport>
  </section>
</template>
