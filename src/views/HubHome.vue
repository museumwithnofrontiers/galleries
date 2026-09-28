<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n, useSiteConfig } from '@museumwnf/viewer-core'
import { FeaturedPartners, SiblingGalleries } from '@museumwnf/viewer-layout/dxa'
import { featuredPartners, galleries, galleryImage, galleryName, galleryUrl, loadEnglish, pickRandom } from '../composables/hub.js'

// The hub's home page, as legacy drew it: four galleries picked at random,
// each linked to its site, with the three MWNF virtual museums beside them,
// then a carousel of three partners picked at random. Legacy drew both picks
// per request and read no flag for either (inventory-app
// scripts/exporters/docs/galleries-hub-data-package.md), so they are drawn
// here per visit from the package's full lists.
const { t, locale } = useI18n()
const { links } = useSiteConfig()

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

// The three virtual museums, in each project's colour, as every gallery site shows them.
const museums = computed(() => [
  { name: t('core.project.islamicArt'), href: `${links.islamicArt}/`, accent: 'var(--mwnf-project-ISLandEPM, #ffcc00)', textColor: 'var(--mwnf-project-ISLandEPM-text, #000000)' },
  { name: t('core.project.baroqueArt'), href: `${links.baroqueArt}/`, accent: 'var(--mwnf-project-DBA, #001d66)', textColor: 'var(--mwnf-project-DBA-text, #ffffff)' },
  { name: t('core.project.sharingHistory'), href: `${links.sharingHistory}/`, accent: 'var(--mwnf-project-AWE, #900000)', textColor: 'var(--mwnf-project-AWE-text, #ffffff)' },
])
</script>

<template>
  <div class="hub-home">
    <h1 class="hub-home__title">{{ t('galleries.identity.title') }}</h1>
    <p class="hub-home__intro">{{ t('galleries.home.intro') }}</p>

    <SiblingGalleries
      :galleries="galleryCards"
      :museums="museums"
      galleries-heading-entry="galleries.home.visitGalleries"
      museums-heading-entry="galleries.home.otherVirtualMuseums"
    />
    <p class="hub-home__more">
      <RouterLink class="mwnf-button" :to="{ name: 'galleries' }">{{ t('galleries.home.seeAllGalleries') }}</RouterLink>
    </p>

    <FeaturedPartners :partners="partnerCards" />
  </div>
</template>

<style scoped>
.hub-home__title {
  margin: 0 0 var(--mwnf-space);
}

.hub-home__intro {
  margin: 0 0 calc(var(--mwnf-space) * 2);
}

.hub-home__more {
  margin: var(--mwnf-space) 0 calc(var(--mwnf-space) * 2);
}
</style>
