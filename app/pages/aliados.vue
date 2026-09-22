<script setup lang="ts">
import { ALIADOS } from '#shared/data/pages'
import { PARTNERS } from '#shared/data/partners'
</script>

<template>
  <ContentPage :content="ALIADOS">
    <PartnerLogos v-if="PARTNERS.length" class="mt-10" />
  </ContentPage>
</template>
