import {
  languageLabels, loadEntities, mwnfLinks, offeredLanguages, sectionMeta, useDataPackage,
} from '@museumwnf/viewer-core'
import { mwnfSocialLinks } from '@museumwnf/viewer-layout'
import { GalleryShell } from '@museumwnf/viewer-layout/dxa'
import { TextPageView } from '@museumwnf/viewer-layout/views'
import { chrome } from './chrome.js'
import HubHome from './views/HubHome.vue'
import GalleriesList from './views/GalleriesList.vue'
import Partners from './views/Partners.vue'
import Partner from './views/Partner.vue'

// The whole declaration of the galleries hub. Before it mounts, the website
// reads nothing from its package but the manifest: the languages it offers,
// their labels and its name come from `manifest.site`, and every record is
// loaded by the route that reads it. Nothing else in `src/` imports
// `@inventory-data`.
//
// The hub lists every MWNF gallery and legacy's partner directory; its package
// ships no items (@museumwnf/galleries-data, inventory-app
// scripts/exporters/docs/galleries-hub-data-package.md).

const { manifest } = useDataPackage()

// The languages the package declares for the site, kept where the partners'
// texts carry them: the partners are the hub's translated records, and it has
// no items for the default rule to read.
export const LANGUAGE_ENTITY = 'partners'
const languages = offeredLanguages({ entity: LANGUAGE_ENTITY })

// Every route names the section it belongs to and the entities its own view
// reads on top of that; this website has no chrome entities every page loads
// regardless, so `sectionMeta()` takes none.
const meta = sectionMeta()

// The About and Credits pages: viewer-layout's TextPageView on one body entry
// and a link back to the landing page.
const back = { label: 'core.action.back', to: { name: 'home' } }
const about = { body: 'galleries.about.body', back }
const credits = { body: 'galleries.credits.body', back }

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
      { section: 'galleries', label: 'gallery.nav.allGalleries', to: { name: 'galleries' } },
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
  },

  // Legacy's banner: a strip with the hub's name on the home page, its "»"
  // leading to the galleries list; a section strip on every other page.
  banner: {
    variant: ({ section }) => (section === 'home' ? 'strip' : 'section'),
    captionLabel: 'layout.banner.detailFrom',
    enter: ({ section, t }) => (section === 'home'
      ? { label: '»', href: '#/galleries', ariaLabel: t('gallery.nav.allGalleries') }
      : null),
  },

  // What a gallery's package would give the shell: the hub's name in the
  // header on inner pages and over the home banner, with no line above
  // either (legacy's "Welcome to" has no source), and gallery 45's banner.
  // The banner's caption needs its item, which the hub package doesn't ship.
  // Legacy's hub has no search, so no "Database replaced" tip either.
  galleryShell: {
    notice: false,
    headerEyebrow: '',
    headerTitle: 'galleries.identity.title',
    bannerEyebrow: '',
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
      path: '/galleries',
      name: 'galleries',
      component: GalleriesList,
      meta: meta('galleries', 'galleries'),
    },
    {
      path: '/partners',
      name: 'partners',
      component: Partners,
      meta: meta('partners', 'partners', 'countries'),
    },
    {
      path: '/partner/:id',
      name: 'partner',
      component: Partner,
      props: true,
      meta: meta('partners', 'partners', 'countries'),
    },
    {
      path: '/about',
      name: 'about',
      component: TextPageView,
      props: { spec: about },
      meta: meta('about'),
    },
    {
      path: '/credits',
      name: 'credits',
      component: TextPageView,
      props: { spec: credits },
      meta: meta('credits'),
    },
  ],

  // Legacy's addresses, each resolving onto a canonical route above.
  // Legacy's item sheets, partner objects and timeline are not rebuilt (the
  // hub ships no items), so their addresses reach the not-found page.
  legacyRoutes: [
    { path: '/list/:page?', resolve: () => ({ name: 'galleries' }) },
    {
      path: '/partner/:database/:country/:museum/:language?',
      resolve: async ({ country, museum }) => {
        const partner = await partnerByLegacyKey(country, museum)
        return partner ? { name: 'partner', params: { id: partner.id } } : null
      },
    },
  ],
}
