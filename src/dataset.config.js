import {
  languageLabels, loadEntities, mwnfLinks, offeredLanguages, sectionMeta, useDataPackage,
} from '@museumwnf/viewer-core'
import { TextPageView } from '@museumwnf/viewer-layout/views'
import SiteShell from './SiteShell.vue'
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

  shell: SiteShell,

  // Everything viewer-layout's SiteShell reads to build the menu, the
  // language switcher and the header/footer link lists.
  navigation: {
    languages: languageLabels(languages),
    links: [
      { section: 'home', label: 'core.nav.home', to: { name: 'home' } },
      { section: 'galleries', label: 'galleries.nav.galleries', to: { name: 'galleries' } },
      { section: 'partners', label: 'core.nav.partners', to: { name: 'partners' } },
      { section: 'about', label: 'galleries.nav.about', to: { name: 'about' } },
      { section: 'credits', label: 'galleries.nav.credits', to: { name: 'credits' } },
    ],
  },

  // Where this website's media lives: the legacy media server carries the
  // gallery pictures whose paths the package ships.
  media: {
    legacyHost: 'https://images.museumwnf.org',
  },

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
