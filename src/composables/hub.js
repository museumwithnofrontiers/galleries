import { entityRef, mediaUrl, partnerView, useDataPackage } from '@museumwnf/viewer-core'

// The hub's records, read the one way every website reads them: lazily, each
// entity a shared ref that stays `null` until a route declaring it in
// `meta.entities` brings its chunk in. Nothing here imports `@inventory-data`.
//
// The package (@museumwnf/galleries-data, inventory-app
// scripts/exporters/docs/galleries-hub-data-package.md) carries every gallery
// the hub lists, in the hub's order, and legacy's partner directory. It
// carries no items.

const pkg = useDataPackage()

export const galleries = entityRef('galleries')
export const partners = entityRef('partners')
export const countries = entityRef('countries')

/** English texts of the partners and their countries, which every partner label reads. */
export function loadEnglish() {
  return Promise.all([pkg.loadTranslations('partners', 'en'), pkg.loadTranslations('countries', 'en')])
}

export function countryLabel(countryId, lang = 'en') {
  return pkg.tr('countries', countryId, lang).name ?? countryId ?? ''
}

// ── Galleries ────────────────────────────────────────────────────────────

/** A gallery's name in `lang`, English where it has none in that language. */
export function galleryName(gallery, lang = 'en') {
  return gallery?.names?.[lang] ?? gallery?.names?.en ?? gallery?.slug ?? ''
}

/**
 * Where a gallery lives. The package records each gallery's legacy host as a
 * reference, never a built address (decision Q3), and the hub links it the
 * way the gallery sites link their siblings.
 */
export function galleryUrl(gallery) {
  return gallery?.legacy_host || null
}

/** The gallery's picture, from the legacy media server the package's path points into. */
export function galleryImage(gallery, size = 'zoom') {
  return gallery?.image_path ? mediaUrl(gallery.image_path, size) : null
}

// Each gallery's icon on the galleries list: legacy's own pictures, which only
// ever lived in its client, kept here under the gallery's legacy key.
const icons = import.meta.glob('../assets/galleries/*.png', { eager: true, import: 'default' })

export function galleryIcon(gallery) {
  return icons[`../assets/galleries/${gallery?.slug}.png`] ?? null
}

/** `count` records at random, reshuffled per call: legacy drew its featured picks per request. */
export function pickRandom(records, count) {
  const pool = [...(records ?? [])]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, count)
}

// ── Partners ─────────────────────────────────────────────────────────────

const partnerRoute = (partner) => ({ name: 'partner', params: { id: partner.id } })

/**
 * What differs by site in viewer-core's partner view-model: the country
 * label and the partner's own page. There is no objects page: the hub ships
 * no items, and every partner's `item_count` is 0.
 */
export const partnerViewCtx = {
  countryLabel: (id) => countryLabel(id),
  route: partnerRoute,
}

/** Legacy's featured partners: `count` of them at random, as viewer-core's `partnerView()` builds them. */
export function featuredPartners(count, lang = 'en') {
  return pickRandom(partners.value, count).map((partner) =>
    partnerView(partner, pkg.tr('partners', partner.id, lang), partnerViewCtx),
  )
}

/**
 * The partner directory, on viewer-layout's `PartnerListView`: legacy's DXA
 * shape — no tiers, grouped by country, with the A–Z / Z–A toggle.
 */
export const partnerList = {
  group: { tier: false, order: 'country' },
  variant: 'open',
  orderToggle: true,
  route: 'partner',
  actions: true,
  label: (countryId) => countryLabel(countryId),
}

/**
 * The partner page, as viewer-layout's `PartnerDetail` reads a family: legacy's
 * tab strip (About · Contact · Logo · homepage) is `PartnerPanel`'s, so the
 * sheet itself shows no field of its own. Every hub partner has a page.
 */
export const partnerDetail = {
  spec: {
    entity: 'partners',
    fields: [],
    credits: [],
    citation: false,
    related: false,
    route: 'partner',
    media: () => [],
  },
  visible: () => true,
  view: (partner, text) => partnerView(partner, text, partnerViewCtx),
  labels: { partner: {} },
}

/**
 * Legacy's "Partner" or "Affiliate": a partner curated at level `partner` in
 * the hub's project is a Partner, one with no level an Affiliate.
 */
export function partnerStatusEntry(partner) {
  return partner?.level === 'partner' ? 'galleries.partner.statusPartner' : 'galleries.partner.statusAffiliate'
}
