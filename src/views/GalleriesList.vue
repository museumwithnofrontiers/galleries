<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@museumwnf/viewer-core'
import { BackLink } from '@museumwnf/viewer-layout/content'
import { LegacyPages } from '@museumwnf/viewer-layout/dxa'
import { galleries, galleryIcon, galleryImage, galleryName, galleryUrl, pickRandom } from '../composables/hub.js'

// Every MWNF gallery, as legacy's /list/<page> drew it: Back and "Select a
// Gallery" to jump straight to one; how many galleries there are and "Show
// All Galleries"; on the first page, six galleries featured at random in a
// grey band; eight galleries a page, four across, each its screenshot over
// its name; and legacy's pager under them. Legacy's /list, which "Show All
// Galleries" and the home page's "See more Galleries" lead to, is every
// gallery on one page with neither the band nor the pager. Each gallery
// links to its own site with a plain anchor: every one of these links leaves
// the hub. The package carries the galleries in the hub's order, English
// name A to Z.
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const PAGE_SIZE = 8
const FEATURED_COUNT = 6

const all = computed(() => galleries.value ?? [])
const paged = computed(() => Boolean(route.params.page))
const lastPage = computed(() => Math.max(1, Math.ceil(all.value.length / PAGE_SIZE)))
const page = computed(() => Math.min(Math.max(1, Number(route.params.page) || 1), lastPage.value))
const shown = computed(() => (paged.value ? all.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE) : all.value))
const pageInfo = computed(() => ({ currentPage: page.value, lastPage: lastPage.value }))

const featured = ref([])
onMounted(() => { featured.value = pickRandom(all.value, FEATURED_COUNT) })

function goToPage(n) {
  router.push({ name: 'galleries', params: { page: String(n) } })
}

function jump(event) {
  const url = event.target.value
  if (url) window.location.assign(url)
}
</script>

<template>
  <section class="hub-list">
    <div class="hub-list__row">
      <BackLink />
      <select class="hub-list__select" :aria-label="t('galleries.list.select')" @change="jump">
        <option value="">{{ t('galleries.list.select') }}</option>
        <option v-for="gallery in all" :key="gallery.id" :value="galleryUrl(gallery) ?? ''" :disabled="!galleryUrl(gallery)">
          {{ galleryName(gallery, locale) }}
        </option>
      </select>
    </div>

    <div class="hub-list__row">
      <p class="hub-list__count">{{ t('galleries.list.count') }} {{ all.length }}</p>
      <RouterLink v-if="paged" class="hub-list__all" :to="{ name: 'galleries' }">{{ t('galleries.list.showAll') }}</RouterLink>
    </div>

    <div v-if="paged && page === 1 && featured.length" class="hub-list__featured">
      <h2 class="hub-list__featured-title">{{ t('galleries.list.featured') }}</h2>
      <div class="hub-list__featured-tiles">
        <component
          :is="galleryUrl(gallery) ? 'a' : 'span'"
          v-for="gallery in featured"
          :key="gallery.id"
          :href="galleryUrl(gallery) ?? undefined"
          class="hub-list__featured-tile"
        >
          <img v-if="galleryImage(gallery)" :src="galleryImage(gallery)" alt="" loading="lazy" />
          <span class="hub-list__featured-name">{{ galleryName(gallery, locale) }}</span>
        </component>
      </div>
    </div>

    <div class="hub-list__grid">
      <component
        :is="galleryUrl(gallery) ? 'a' : 'span'"
        v-for="gallery in shown"
        :key="gallery.id"
        :href="galleryUrl(gallery) ?? undefined"
        class="hub-list__card"
      >
        <img v-if="galleryIcon(gallery)" :src="galleryIcon(gallery)" alt="" loading="lazy" />
        <span class="hub-list__name">{{ galleryName(gallery, locale) }}</span>
      </component>
    </div>

    <LegacyPages v-if="paged" family="gallery" class="hub-list__pages" :page-info="pageInfo" @navigate="goToPage" />
  </section>
</template>

<style scoped>
/* Legacy's list (galleries.museumwnf.org /list): a white panel 50px in. */
.hub-list {
  padding: 50px;
  background: #ffffff;
  color: #000000;
  line-height: normal;
}

.hub-list__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

/* Legacy's Back here is its 16px bold button, 2px in, on the row's line. */
.hub-list__row :deep(.mwnf-back-link) {
  padding: 0;
}
.hub-list__row :deep(.mwnf-back-link__button) {
  padding: 2px;
  font-size: 16px;
  line-height: normal;
}

.hub-list__select {
  width: 244px;
  font: inherit;
}

.hub-list__count,
.hub-list__all {
  margin: 0;
  font-weight: 700;
  color: inherit;
  text-decoration: none;
}

.hub-list__featured {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: var(--background-color);
}

.hub-list__featured-title {
  margin: 0 0 20px;
  font-size: 24px;
  font-weight: 700;
  color: var(--theme-dark);
  text-transform: uppercase;
}

.hub-list__featured-tiles {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.hub-list__featured-tile {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 10px;
  text-decoration: none;
}

.hub-list__featured-tile img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.hub-list__featured-name {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  text-shadow: 2px 2px 5px #000000;
}

.hub-list__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 35px;
  margin: 50px 0;
}

.hub-list__card {
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 4px 1px rgba(0, 0, 0, 0.4);
  color: #ffffff;
  text-align: center;
  text-decoration: none;
}

.hub-list__card img {
  display: block;
  width: 100%;
  height: 260px;
}

.hub-list__name {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
  padding: 5px;
  background: var(--theme-medium-dark);
  text-transform: uppercase;
}

/* The hub's own pager draws every page it cannot go to, the current one
   too, in the same light grey and underlined. */
.hub-list__pages :deep(.mwnf-dxa-gallery-pages__button.is-disabled) {
  color: rgba(16, 16, 16, 0.3);
  font-weight: 400;
  text-decoration: underline;
}

@media only screen and (max-width: 974px) {
  .hub-list__grid { grid-template-columns: repeat(2, 1fr); }
}

@media only screen and (max-width: 599px) {
  .hub-list { padding: 30px 15px; }
  .hub-list__row { flex-wrap: wrap; gap: 10px; }
  .hub-list__grid { grid-template-columns: 1fr; }
}
</style>
