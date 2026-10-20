<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n, useSiteConfig } from '@museumwnf/viewer-core'
import { chromeAsset } from '@museumwnf/viewer-layout'
import { FeaturedPartners, SiblingGalleries } from '@museumwnf/viewer-layout/dxa'
import { chrome } from '../chrome.js'
import { featuredPartners, galleries, galleryImage, galleryName, galleryUrl, loadEnglish, pickRandom } from '../composables/hub.js'

// The hub's home page, as legacy drew it (a DXA gallery home, gallery 45):
// under the banner, a carousel of three partners picked at random, then four
// galleries picked at random, each linked to its site, with "See more
// Galleries" and the three MWNF virtual museums beside them. Legacy drew both
// picks per request and read no flag for either (inventory-app
// scripts/exporters/docs/galleries-hub-data-package.md), so they are drawn
// here per visit from the package's full lists. Legacy has no text of its
// own on this page.
const { t, locale } = useI18n()
const { links } = useSiteConfig()
const router = useRouter()

const GALLERY_COUNT = 4
const PARTNER_COUNT = 3

const picked = ref([])
const partnerCards = ref([])
onMounted(async () => {
  picked.value = pickRandom(galleries.value, GALLERY_COUNT)
  await loadEnglish()
  partnerCards.value = featuredPartners(PARTNER_COUNT)
})

const galleryCards = computed(() =>
  picked.value.map((gallery) => ({
    id: gallery.id,
    name: galleryName(gallery, locale.value),
    image: galleryImage(gallery),
    route: galleryUrl(gallery),
  })),
)

// The three virtual museums as every gallery site shows them: legacy's
// picture banners (theme/assets/dia.jpg, dba.jpg, sh.jpg), each project's
// colour behind them.
const museums = computed(() => [
  { name: t('core.project.islamicArt'), href: `${links.islamicArt}/`, image: chromeAsset(chrome, 'dia.jpg'), accent: 'var(--mwnf-project-ISLandEPM, #ffcc00)', textColor: 'var(--mwnf-project-ISLandEPM-text, #000000)' },
  { name: t('core.project.baroqueArt'), href: `${links.baroqueArt}/`, image: chromeAsset(chrome, 'dba.jpg'), accent: 'var(--mwnf-project-DBA, #001d66)', textColor: 'var(--mwnf-project-DBA-text, #ffffff)' },
  { name: t('core.project.sharingHistory'), href: `${links.sharingHistory}/`, image: chromeAsset(chrome, 'sh.jpg'), accent: 'var(--mwnf-project-AWE, #900000)', textColor: 'var(--mwnf-project-AWE-text, #ffffff)' },
])

// "See more Galleries" leads to the hub's own list, as legacy's did.
const seeMoreGalleriesHref = router.resolve({ name: 'galleries' }).href
</script>

<template>
  <div class="hub-home">
    <FeaturedPartners :partners="partnerCards" />
    <SiblingGalleries
      :galleries="galleryCards"
      :museums="museums"
      galleries-heading-entry="gallery.action.visitGalleries"
      see-more-galleries-entry="gallery.action.seeMoreGalleries"
      :see-more-galleries-href="seeMoreGalleriesHref"
      museums-heading-entry="gallery.siblings.otherVirtualMuseums"
    />
  </div>
</template>
