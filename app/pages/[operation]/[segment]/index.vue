<script setup lang="ts">
import { findPropertyType, findZone, isOperationSlug } from '#shared/data/taxonomy'
import type { OperationSlug } from '#shared/data/taxonomy'

/**
 * El segundo segmento puede ser un municipio (/arriendo/sabaneta) o un tipo
 * (/arriendo/apartamentos). Cualquier otra cosa no existe.
 */
definePageMeta({
  validate: (route) => {
    const { operation, segment } = route.params
    if (typeof operation !== 'string' || !isOperationSlug(operation)) return false
    if (typeof segment !== 'string') return false
    return Boolean(findZone(segment) || findPropertyType(segment))
  },
})

const route = useRoute()
const operation = computed(() => route.params.operation as OperationSlug)
const segment = computed(() => String(route.params.segment))

const zoneSlug = computed(() => (findZone(segment.value) ? segment.value : undefined))
const typeSlug = computed(() => (zoneSlug.value ? undefined : segment.value))
</script>

<template>
  <PropertyListing :operation="operation" :zone-slug="zoneSlug" :type-slug="typeSlug" />
</template>
