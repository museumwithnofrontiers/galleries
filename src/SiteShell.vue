<script setup>
// The page structure is entirely @museumwnf/viewer-layout's SiteShell, which
// composes PageShell from what `dataset.config.js` puts under `navigation`
// and `links`: the menu, the header/footer link lists, the search submit and
// the banner. Nothing here builds a menu or reads `useSection()` — that
// belongs to the shared component, once, and a website that duplicates it
// drifts from the platform the next time SiteShell gains a feature.
//
// What is this website's own is legacy's chrome (it is a DXA gallery,
// gallery 45): the MWNF logo, linking to MWNF's portal, and the footer's
// copyright line with legacy's years.
import { useI18n, useSiteConfig } from '@museumwnf/viewer-core'
import { SiteShell } from '@museumwnf/viewer-layout/components'
import mwnfLogo from '../theme/assets/mwnf-logo.png'

const { t } = useI18n()
const { links } = useSiteConfig()
const currentYear = new Date().getFullYear()
</script>

<template>
  <SiteShell
    v-bind="$attrs"
    :header-home="links.portal"
    :footer-text="`${t('core.footer.copyright')} 2004–${currentYear}`"
  >
    <template #brand>
      <img class="site-logo" :src="mwnfLogo" :alt="t('galleries.identity.organisation')" />
    </template>
    <slot />
  </SiteShell>
</template>

<style scoped>
/* Legacy's logo, at its own size. */
.site-logo {
  display: block;
  width: 120px;
  height: 50px;
}
</style>
