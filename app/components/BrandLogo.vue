<script setup lang="ts">
const props = withDefaults(defineProps<{ size?: number }>(), { size: 34 })

/** El isotipo oficial mide 320x269. */
const ASPECT = 320 / 269

const height = computed(() => Math.round(props.size / ASPECT))
</script>

<template>
  <!--
    Isotipo oficial de Inmobarco. Es un PNG de dos tintas (#48BFF7 y el ink de
    marca), no un vector, así que no se puede recolorear: solo vale sobre fondo
    claro. Si algún día hace falta sobre fondo oscuro, hay que pedir la versión
    en negativo.
  -->
  <img
    src="/brand/isotipo.png"
    alt=""
    aria-hidden="true"
    :width="size"
    :height="height"
    class="flex-none"
  >
</template>
