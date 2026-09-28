import {
  languageLabels, mwnfLinks, offeredLanguages, sectionMeta, useDataPackage,
} from '@museumwnf/viewer-core'
import { HomeView, TextPageView } from '@museumwnf/viewer-layout/views'
import SiteShell from './SiteShell.vue'

// The whole declaration of the galleries hub. Before it mounts, the website
// reads nothing from its package but the manifest: the languages it offers,
// their labels and its name come from `manifest.site`, and every record is
// loaded by the route that reads it. Nothing else in `src/` imports
// `@inventory-data`.
//
// The hub lists galleries and a partner directory; its package ships no items
// (@museumwnf/galleries-data, inventory-app
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

  views: { home: HomeView },

  // What the landing page shows. Every text is an entry name that the view
  // resolves, so a translator's file changes the page.
  home: {
    title: 'galleries.identity.title',
    intro: 'galleries.home.intro',
    cards: [
      {
        title: 'galleries.nav.about',
        description: 'galleries.home.aboutText',
        action: 'core.action.viewDetails',
        to: { name: 'about' },
      },
      {
        title: 'galleries.nav.credits',
        description: 'galleries.home.creditsText',
        action: 'core.action.viewDetails',
        to: { name: 'credits' },
      },
    ],
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
      { section: 'about', label: 'galleries.nav.about', to: { name: 'about' } },
      { section: 'credits', label: 'galleries.nav.credits', to: { name: 'credits' } },
    ],
  },

  // Where this website's media lives: the legacy media server carries the
  // gallery images whose paths the package ships.
  media: {
    legacyHost: 'https://images.museumwnf.org',
  },

  links: mwnfLinks,

  // The route map. Every route is named and says which section it belongs to.
  extraViews: [
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

  legacyRoutes: [],
}
