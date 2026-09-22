<script setup lang="ts">
import { isOperationSlug } from '#shared/data/taxonomy'
import type { OperationSlug } from '#shared/data/taxonomy'

// Un primer segmento que no sea arriendo o venta devuelve 404 (§6.1).
definePageMeta({
  validate: route => typeof route.params.operation === 'string' && isOperationSlug(route.params.operation),
})

const route = useRoute()
const operation = computed(() => route.params.operation as OperationSlug)
</script>

<template>
  <PropertyListing :operation="operation" />
</template>
