<script setup lang="ts">
const NAV_LINKS = [
  { label: 'Arriendo', to: '/arriendo' },
  { label: 'Venta', to: '/venta' },
  { label: 'Propietarios', to: '/propietarios' },
  { label: 'Nosotros', to: '/nosotros' },
  { label: 'Contacto', to: '/contacto' },
]

const menuOpen = ref(false)
const { y } = useWindowScroll()

/** Al bajar, el header se encoge y marca el borde con sombra (§7.1, bloque 2). */
const scrolled = computed(() => y.value > 24)
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur transition-shadow"
    :class="scrolled ? 'shadow-sm' : ''"
  >
    <div
      class="mx-auto flex max-w-page items-center gap-8 px-4 transition-all md:px-6"
      :class="scrolled ? 'min-h-[58px]' : 'min-h-[74px]'"
    >
      <NuxtLink to="/" class="flex items-center gap-2.5" aria-label="Inmobarco, inicio">
        <BrandLogo />
        <span class="font-display text-[1.3rem] font-bold tracking-[-0.03em]">inmobarco</span>
      </NuxtLink>

      <nav class="ml-auto hidden gap-7 text-[0.9375rem] font-medium lg:flex" aria-label="Principal">
        <NuxtLink
          v-for="link in NAV_LINKS"
          :key="link.to"
          :to="link.to"
          class="border-b-2 border-transparent py-1.5 hover:border-primary"
          active-class="border-primary"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <BaseButton to="/propietarios" class="ml-2 hidden lg:inline-flex">
        Consigna tu inmueble
      </BaseButton>

      <button
        type="button"
        class="ml-auto flex h-[42px] w-[42px] flex-col items-center justify-center gap-[3px] rounded-sm border border-line lg:hidden"
        :aria-expanded="menuOpen"
        aria-controls="menu-movil"
        aria-label="Abrir menú"
        @click="menuOpen = true"
      >
        <span v-for="line in 3" :key="line" class="block h-0.5 w-[18px] bg-ink" />
      </button>
    </div>

    <MobileMenu id="menu-movil" v-model:open="menuOpen" :links="NAV_LINKS" />
  </header>
</template>
