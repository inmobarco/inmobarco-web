<template>
  <div class="flex min-h-dvh flex-col">
    <a
      href="#contenido"
      class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-100 focus:rounded-sm focus:bg-primary focus:px-4 focus:py-2 focus:font-semibold focus:text-ink"
    >
      Saltar al contenido
    </a>

    <TheTopBar />
    <TheHeader />

    <div id="contenido" class="flex-1">
      <slot />
    </div>

    <TheFooter />
    <WhatsAppFab />
  </div>
</template>
