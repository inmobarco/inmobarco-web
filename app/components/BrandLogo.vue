<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 30 })
</script>

<template>
  <!-- Marca provisional del mockup. Pendiente el SVG oficial de Inmobarco (§15.3). -->
  <svg :width="size" :height="size" viewBox="0 0 32 32" aria-hidden="true" class="flex-none">
    <rect x="1" y="12" width="12" height="19" rx="2" fill="#141F21" />
    <rect x="16" y="4" width="15" height="27" rx="2" fill="#48BFF7" />
    <rect x="20" y="9" width="3.5" height="3.5" fill="#141F21" />
    <rect x="26" y="9" width="3.5" height="3.5" fill="#141F21" />
    <rect x="20" y="16" width="3.5" height="3.5" fill="#141F21" />
    <rect x="26" y="16" width="3.5" height="3.5" fill="#141F21" />
    <rect x="20" y="23" width="9.5" height="8" fill="#141F21" />
  </svg>
</template>
