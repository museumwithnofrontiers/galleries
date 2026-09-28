<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from '@museumwnf/viewer-core'
import { BackLink } from '@museumwnf/viewer-layout/content'
import { galleries, galleryIcon, galleryImage, galleryName, galleryUrl, pickRandom } from '../composables/hub.js'

// Every MWNF gallery, as legacy's /list drew it: how many there are, a list
// to jump straight to one, an A–Z / Z–A toggle, four galleries featured at
// random, then the grid of every gallery with its icon. Each gallery links to
// its own site (galleryUrl) with a plain anchor: every one of these links
// leaves the hub. The package already carries the galleries in the hub's
// order, English name A to Z.
const { t, locale } = useI18n()

const FEATURED_COUNT = 4

const reversed = ref(false)
const featured = ref([])
onMounted(() => { featured.value = pickRandom(galleries.value, FEATURED_COUNT) })

const ordered = computed(() => {
  const list = [...(galleries.value ?? [])]
  return reversed.value ? list.reverse() : list
})

function jump(event) {
  const url = event.target.value
  if (url) window.location.assign(url)
}
</script>

<template>
  <section class="hub-galleries">
    <BackLink />
    <h1 class="hub-galleries__title">{{ t('galleries.list.title') }}</h1>

    <div class="hub-galleries__controls">
      <select class="hub-galleries__jump" :aria-label="t('galleries.list.jump')" @change="jump">
        <option value="">{{ t('galleries.list.jump') }}</option>
        <option v-for="gallery in galleries ?? []" :key="gallery.id" :value="galleryUrl(gallery) ?? ''" :disabled="!galleryUrl(gallery)">
          {{ galleryName(gallery, locale) }}
        </option>
      </select>
      <p class="hub-galleries__count">{{ t('galleries.list.count') }} {{ (galleries ?? []).length }}</p>
      <button type="button" class="mwnf-button hub-galleries__toggle" @click="reversed = !reversed">
        {{ t(reversed ? 'galleries.list.sortAscending' : 'galleries.list.sortDescending') }}
      </button>
    </div>

    <div v-if="featured.length" class="hub-galleries__featured">
      <h2 class="hub-galleries__featured-title">{{ t('galleries.list.featured') }}</h2>
      <div class="hub-galleries__featured-grid">
        <component
          :is="galleryUrl(gallery) ? 'a' : 'span'"
          v-for="gallery in featured"
          :key="gallery.id"
          :href="galleryUrl(gallery) ?? undefined"
          class="hub-galleries__featured-card"
        >
          <img v-if="galleryImage(gallery)" :src="galleryImage(gallery)" :alt="galleryName(gallery, locale)" loading="lazy" />
          <span class="hub-galleries__featured-name">{{ galleryName(gallery, locale) }}</span>
        </component>
      </div>
    </div>

    <div class="hub-galleries__grid">
      <component
        :is="galleryUrl(gallery) ? 'a' : 'span'"
        v-for="gallery in ordered"
        :key="gallery.id"
        :href="galleryUrl(gallery) ?? undefined"
        class="hub-galleries__card"
      >
        <img v-if="galleryIcon(gallery)" :src="galleryIcon(gallery)" alt="" loading="lazy" />
        <span class="hub-galleries__name">{{ galleryName(gallery, locale) }}</span>
      </component>
    </div>
  </section>
</template>

<style scoped>
.hub-galleries__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--mwnf-space);
  margin: var(--mwnf-space) 0;
}

.hub-galleries__count {
  margin: 0;
  font-weight: 600;
}

.hub-galleries__featured-grid,
.hub-galleries__grid {
  display: grid;
  gap: var(--mwnf-space);
  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
}

.hub-galleries__featured {
  margin: calc(var(--mwnf-space) * 2) 0;
}

.hub-galleries__featured-card,
.hub-galleries__card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: inherit;
  text-decoration: none;
}

.hub-galleries__featured-card img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.hub-galleries__card img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: contain;
}

.hub-galleries__name {
  text-transform: uppercase;
  font-weight: 600;
}
</style>
