<script setup lang="ts">
type Variant = 'primary' | 'secondary' | 'ghost' | 'onInk' | 'link'
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(defineProps<{
  variant?: Variant
  size?: Size
  block?: boolean
  /** Ruta interna. Usa NuxtLink y aprovecha el prefetch. */
  to?: string
  /** URL externa. Añade target, rel y el aviso para lectores de pantalla (§6.2). */
  href?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  to: undefined,
  href: undefined,
})

const tag = computed(() => (props.to ? resolveComponent('NuxtLink') : props.href ? 'a' : 'button'))

const variantClass: Record<Variant, string> = {
  // El texto sobre el primario siempre es ink, nunca blanco (§4.2, CERRADO): 8.1:1.
  primary: 'bg-primary text-ink border-primary hover:bg-primary-300 hover:border-primary-300',
  // Blanco solo a partir de primary-700 (§4.2): 4.9:1 sobre #1878AC.
  secondary: 'bg-primary-700 text-white border-primary-700 hover:bg-primary-800 hover:border-primary-800',
  ghost: 'bg-transparent text-ink border-line hover:border-ink',
  onInk: 'bg-transparent text-white border-white/35 hover:border-white hover:bg-white/10',
  link: 'border-transparent px-0 font-semibold text-primary-700 underline decoration-primary-200 decoration-2 underline-offset-4 hover:decoration-primary-700',
}

const sizeClass: Record<Size, string> = {
  sm: 'h-[34px] px-[14px] text-sm',
  md: 'h-11 px-[22px] text-[0.9375rem]',
  lg: 'h-[52px] px-7 text-base',
}
</script>

<template>
  <component
    :is="tag"
    :to="to"
    :href="href"
    :type="tag === 'button' ? type : undefined"
    :disabled="tag === 'button' ? disabled : undefined"
    :target="href ? '_blank' : undefined"
    :rel="href ? 'noopener noreferrer' : undefined"
    :aria-disabled="disabled || undefined"
    class="inline-flex items-center justify-center gap-2 rounded-sm border font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
    :class="[
      variantClass[variant],
      variant === 'link' ? 'h-auto' : sizeClass[size],
      block ? 'w-full' : '',
    ]"
  >
    <slot />
    <span v-if="href" class="sr-only">(abre en una nueva pestaña)</span>
  </component>
</template>
