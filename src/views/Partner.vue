<script setup>
import { PartnerDetail } from '@museumwnf/viewer-layout/dxa'
import { partnerDetail } from '../composables/hub.js'

// One partner's page: the DXA families' shared partner page, legacy's tab
// strip, with the hub's own family half (composables/hub.js).
defineProps({
  id: { type: String, required: true },
})
</script>

<template>
  <PartnerDetail :id="id" :family="partnerDetail" />
</template>
