<script setup>
import { I18nText, useI18n, useProjects } from '@museumwnf/viewer-core'
import { BackLink, PartnerPanel } from '@museumwnf/viewer-layout/content'
import { PartnerListView } from '@museumwnf/viewer-layout/views'
import { isCuratedPartner, partnerList } from '../composables/hub.js'

// The hub's partner directory, on the platform's composed partner list: the
// grouping by country, the A–Z / Z–A toggle and the query are the view's.
// Under every name, legacy printed the partner's project and whether it is a
// Partner or an Affiliate, which is this page's own line; the hub ships no
// items, so no partner has an objects link.
const { t } = useI18n()
const projects = useProjects()
</script>

<template>
  <div class="hub-partners">
    <PartnerListView :spec="partnerList">
      <template #before>
        <BackLink />
        <I18nText class="mwnf-prose" dir="auto" keypath="galleries.partners.intro" />
      </template>
      <template #row="{ partner, view }">
        <PartnerPanel variant="line" :partner="view" :show="{ actions: true }">
          <template #meta>
            <p class="hub-partners__status">
              {{ projects.label(partner.project_uuids?.[0]) }}
              {{ isCuratedPartner(partner) ? t('galleries.partner.statusPartner') : t('galleries.partner.statusAffiliate') }}
            </p>
          </template>
        </PartnerPanel>
      </template>
    </PartnerListView>
  </div>
</template>

<style scoped>
.hub-partners__status {
  margin: 0;
  font-size: 0.9em;
}
</style>
