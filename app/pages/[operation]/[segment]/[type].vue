<script setup lang="ts">
import { findPropertyType, findZone, isOperationSlug } from '#shared/data/taxonomy'
import type { OperationSlug } from '#shared/data/taxonomy'

// Combinada zona + tipo: /arriendo/sabaneta/apartamentos (§6.1).
definePageMeta({
  validate: (route) => {
    const { operation, segment, type } = route.params
    if (typeof operation !== 'string' || !isOperationSlug(operation)) return false
    if (typeof segment !== 'string' || typeof type !== 'string') return false
    return Boolean(findZone(segment) && findPropertyType(type))
  },
})

const route = useRoute()
const operation = computed(() => route.params.operation as OperationSlug)
const zoneSlug = computed(() => String(route.params.segment))
const typeSlug = computed(() => String(route.params.type))
</script>

<template>
  <PropertyListing :operation="operation" :zone-slug="zoneSlug" :type-slug="typeSlug" />
</template>
