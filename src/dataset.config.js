import {
  languageLabels, loadEntities, mwnfLinks, offeredLanguages, sectionMeta, useDataPackage,
} from '@museumwnf/viewer-core'
import { mwnfSocialLinks } from '@museumwnf/viewer-layout'
import {
  GalleryAbout, GalleryCredits, GalleryItemDetail, GalleryPartnerObjects, GalleryPartners, GalleryShell, PartnerDetail,
  galleryPartnerDetail,
} from '@museumwnf/viewer-layout/dxa'
import { chrome } from './chrome.js'
import HubHome from './views/HubHome.vue'
import GalleriesList from './views/GalleriesList.vue'

// The whole declaration of the galleries hub. Before it mounts, the website
// reads nothing from its package but the manifest: the languages it offers,
// their labels and its name come from `manifest.site`, and every record is
// loaded by the route that reads it. Nothing else in `src/` imports
// `@inventory-data`.
//
// The hub lists every MWNF gallery and legacy's partner directory, and its
// partners' MWNF Galleries objects (@museumwnf/galleries-data, inventory-app
// scripts/exporters/docs/galleries-hub-data-package.md, #2425). Legacy's hub
// is a DXA gallery, so its partner list, partner pages, partner objects and
// object pages are the gallery family's.

const { manifest } = useDataPackage()

// The languages the package declares for the site, kept where the partners'
// texts carry them: the partners are the hub's translated records, and it has
// no items for the default rule to read.
export const LANGUAGE_ENTITY = 'partners'
const languages = offeredLanguages({ entity: LANGUAGE_ENTITY })

// Every route names the section it belongs to and the entities its own view
// reads on top of that; every page loads the hub's record and its objects,
// which the shell's banner caption reads, as on a gallery site.
const meta = sectionMeta(['gallery', 'items', 'partners', 'countries'])


/** An object by legacy's own key (`<database>/<country>/<museum id>/<number>`), for legacy's object addresses. */
async function itemByLegacyKey(database, country, museum, number) {
  const [items] = await loadEntities(['items'])
  const key = `mwnf3:objects:${database}:${country}:${museum}:${number}`
  return items.find((item) => item.backward_compatibility === key) ?? null
}

/** A partner by legacy's own key (`<country>/<museum id>`), for legacy's partner addresses. */
async function partnerByLegacyKey(country, museum) {
  const [partners] = await loadEntities(['partners'])
  const key = `mwnf3:museums:${museum}:${country}`
  return partners.find((partner) => partner.backward_compatibility === key) ?? null
}

export default {
  // The dataset package this website renders. Must match the alias in
  // vite.config.js and the dependency in package.json.
  datasetPackage: '@museumwnf/galleries-data',

  // The website's name, as the package declares it.
  siteName: manifest.site?.names?.en ?? 'MWNF Galleries',

  // The address this build is deployed at, base path included: the object
  // sheet's source credit and citation, and the sibling sites' links, read it.
  site: { origin: 'https://museumwithnofrontiers.github.io/galleries' },

  // The source-database chip's colour on the object sheet, per project: the
  // hub's objects are all MWNF Galleries records.
  projectColors: {
    'a0817323-79ca-53fc-95ac-9f65ee2fcbac': 'mwnf-chip--Galleries', // MWNF Galleries
  },

  features: {
    // No generic entity pages: those routes expose the data package's shape
    // rather than the site's.
    entities: [],
  },

  // The site language. One per visit, negotiated once by viewer-core.
  languages,

  // Legacy's hub is a DXA gallery (dxa-client, site galleries, gallery 45),
  // so its chrome is the gallery family's shell, fed from `galleryShell`
  // below rather than from a gallery package.
  shell: GalleryShell,

  // Everything the shell reads to build the menu, the language switcher and
  // the header/footer link lists: legacy's menu (About · All Galleries ·
  // Partners · Credits), under the banner on the home page and above it
  // elsewhere; "Home" in the header; MWNF's pages and its social networks in
  // the footer.
  navigation: {
    languages: languageLabels(languages),
    links: [
      { section: 'about', label: 'galleries.nav.about', to: { name: 'about' } },
      { section: 'galleries', label: 'galleries.nav.allGalleries', to: { name: 'galleries', params: { page: '1' } } },
      { section: 'partners', label: 'core.nav.partners', to: { name: 'partners' } },
      { section: 'credits', label: 'galleries.nav.credits', to: { name: 'credits' } },
    ],
    headerLinks: [{ label: 'core.nav.home', to: { name: 'home' } }],
    footerLinks: [
      { label: 'core.footer.aboutMwnf', href: mwnfLinks.about, external: true },
      { label: 'core.footer.contact', href: mwnfLinks.contact, external: true },
      { label: 'core.footer.legalNotice', href: mwnfLinks.legalNotice, external: true },
      { label: 'core.footer.credits', href: mwnfLinks.credits, external: true },
      { label: 'core.footer.cookies', href: mwnfLinks.cookies, external: true },
    ],
    placement: ({ section }) => (section === 'home' ? 'after-banner' : 'before-banner'),
    socialLinks: mwnfSocialLinks,
    // The inner pages' banner titles, as a gallery's; the galleries list has
    // its own (`banner.title` below).
    sectionTitles: {
      about: 'core.section.about',
      credits: 'core.section.credits',
      partners: 'core.section.partners',
      database: 'core.section.database',
    },
  },

  // Legacy's banner: a strip with the hub's name on the home page, its "»"
  // leading to the galleries list's first page; a section strip on every
  // other page, titled "Galleries List" over every gallery (/list) and not
  // at all over a page of them (/list/<page>).
  banner: {
    variant: ({ section }) => (section === 'home' ? 'strip' : 'section'),
    captionLabel: 'layout.banner.detailFrom',
    title: ({ route, t }) => (route?.name === 'galleries' && !route.params.page ? t('galleries.list.bannerTitle') : ''),
    enter: ({ section, t }) => (section === 'home'
      ? { label: '»', href: '#/list/1', ariaLabel: t('gallery.nav.allGalleries') }
      : null),
  },

  // What differs from a gallery's shell: the hub's name in the header on
  // inner pages and over the home banner, legacy's "Welcome to" above it on
  // the home page and no line above the header's, and gallery 45's banner
  // picture from this repository. The banner's caption is the shell's own,
  // from the package's `gallery.json` and the object it names. Legacy's hub
  // has no search, so no "Database replaced" tip either.
  galleryShell: {
    notice: false,
    headerEyebrow: '',
    headerTitle: 'galleries.identity.title',
    bannerEyebrow: 'galleries.home.welcomeTo',
    bannerTitle: 'galleries.identity.title',
    bannerImage: 'chrome/thematic_gallery/thg_galleries/45/banner.jpg',
  },

  // The site's own chrome files (inventory-app#2233 D7), all legacy's: the
  // MWNF logo, the three virtual museums' banners, gallery 45's banner and
  // every gallery's tile picture (src/chrome.js).
  chrome,
  brand: { logo: 'logo.png', alt: 'galleries.identity.organisation' },

  links: mwnfLinks,

  // The route map. Every route is named, says which section it belongs to,
  // and declares the entities its view reads, so the router loads them before
  // the view is created. The home page is registered here rather than through
  // `views.home` so that it can declare its entities too.
  extraViews: [
    {
      path: '/',
      name: 'home',
      component: HubHome,
      meta: meta('home', 'galleries', 'partners', 'countries'),
    },
    {
      // Legacy's own addresses: /list, every gallery; /list/<page>, eight of them.
      path: '/list/:page?',
      name: 'galleries',
      component: GalleriesList,
      meta: meta('galleries', 'galleries'),
    },
    {
      path: '/partners',
      name: 'partners',
      component: GalleryPartners,
      meta: meta('partners', 'partners', 'countries', 'items'),
    },
    {
      path: '/partner/:id',
      name: 'partner',
      component: PartnerDetail,
      props: (route) => ({ id: route.params.id, family: galleryPartnerDetail }),
      meta: meta('partners', 'partners', 'countries', 'items', 'languages'),
    },
    {
      path: '/partner/:id/objects',
      name: 'partner-objects',
      component: GalleryPartnerObjects,
      meta: meta('partners', 'partners', 'countries', 'items'),
    },
    {
      path: '/item/:id',
      name: 'item',
      component: GalleryItemDetail,
      props: true,
      meta: meta(
        'database', 'items', 'partners', 'countries', 'languages', 'tags', 'dynasties', 'glossary', 'timelines',
        'timeline_events',
      ),
    },
    // The About and Credits pages as a gallery's, in legacy's centred column:
    // About reads the shared entry, which locales/en.json overloads with the
    // hub's own text, as it does the partner list's introduction.
    {
      path: '/about',
      name: 'about',
      component: GalleryAbout,
      meta: meta('about'),
    },
    {
      path: '/credits',
      name: 'credits',
      component: GalleryCredits,
      props: { bodyKey: 'galleries.credits.body' },
      meta: meta('credits'),
    },
  ],

  // Legacy's addresses, each resolving onto a canonical route above.
  legacyRoutes: [
    // The list's address before it took legacy's own.
    { path: '/galleries', resolve: () => ({ name: 'galleries', params: { page: '1' } }) },
    {
      path: '/partner/:database/:country/:museum/:language?',
      resolve: async ({ country, museum }) => {
        const partner = await partnerByLegacyKey(country, museum)
        return partner ? { name: 'partner', params: { id: partner.id } } : null
      },
    },
    {
      path: '/partner-objects/:database/:country/:museum/:page?',
      resolve: async ({ country, museum, page }) => {
        const partner = await partnerByLegacyKey(country, museum)
        if (!partner) return null
        return { name: 'partner-objects', params: { id: partner.id }, query: Number(page) > 1 ? { page } : {} }
      },
    },
    {
      path: '/database-item/:database/:country/:museum/:number/:language?',
      resolve: async ({ database, country, museum, number }) => {
        const item = await itemByLegacyKey(database, country, museum, number)
        return item ? { name: 'item', params: { id: item.id } } : null
      },
    },
  ],
}
