import { describe, expect, it, vi } from 'vitest'
import { loadEntities, mergeMessages } from '@museumwnf/viewer-core'
import {
  checkOfferedLanguages, checkRoutes, checkSectionMeta, checkTextsRendered, mountSite,
} from '@museumwnf/viewer-core/testing'
import { catalogues as sharedTexts } from '@museumwnf/viewer-i18n/standalone'
import ownTexts from '../locales/en.json'
import config, { LANGUAGE_ENTITY } from '../src/dataset.config.js'

// The same two layers main.js assembles, in the same order: the shared bundle
// first, this website's own file last. Mounting without them would prove
// nothing about the chrome — every text would render as its own name.
const messages = mergeMessages(sharedTexts, { en: ownTexts })

// Every page is mounted against the real data package, on its own address,
// as a visitor arrives from a link.
async function mountOn(hash, selector) {
  const site = await mountSite(config, messages, hash)
  await vi.waitFor(() => expect(site.host.querySelector(selector)).not.toBeNull(), { timeout: 20000 })
  return site
}

describe('website smoke test', () => {
  it('mounts the home page: galleries picked from the package, and its partners', async () => {
    const { app, host } = await mountOn('#/', '.mwnf-sibling-galleries__gallery')

    expect(host.querySelector('.mwnf-page')).not.toBeNull()
    expect(host.querySelector('.hub-home__title').textContent.trim()).toBe('MWNF Galleries')
    // Four galleries drawn at random, and the three virtual museums beside them.
    expect(host.querySelectorAll('.mwnf-sibling-galleries__gallery')).toHaveLength(4)
    expect(host.querySelectorAll('.mwnf-sibling-galleries__museum')).toHaveLength(3)
    // Each gallery links to its own site.
    for (const link of host.querySelectorAll('a.mwnf-sibling-galleries__gallery')) {
      expect(link.getAttribute('href')).toMatch(/^https:\/\/[a-z-]+\.museumwnf\.org/)
    }

    app.unmount()
  }, 60000)

  it('lists every gallery the package carries, each linked to its site', async () => {
    const [galleries] = await loadEntities(['galleries'])
    const { app, host } = await mountOn('#/galleries', '.hub-galleries__card')

    const cards = host.querySelectorAll('.hub-galleries__card')
    expect(cards).toHaveLength(galleries.length)
    expect(cards[0].textContent.trim()).toBe(galleries[0].names.en)
    expect(host.querySelector('.hub-galleries__count').textContent).toContain(String(galleries.length))
    // Legacy's icon for every gallery, bundled with the site.
    expect([...cards].every((card) => card.querySelector('img'))).toBe(true)

    app.unmount()
  }, 60000)

  it("lists the partners by country, each marked Partner or Affiliate", async () => {
    const [partners] = await loadEntities(['partners'])
    const { app, host } = await mountOn('#/partners', '.hub-partners__status')

    const statuses = [...host.querySelectorAll('.hub-partners__status')].map((line) => line.textContent.trim())
    expect(statuses).toHaveLength(partners.length)
    expect(statuses.filter((line) => line.endsWith('Affiliate'))).toHaveLength(
      partners.filter((partner) => partner.level === null).length,
    )
    expect(statuses.every((line) => line.startsWith('MWNF Galleries'))).toBe(true)
    // The hub ships no items: no partner offers an objects link.
    expect(host.textContent).not.toContain('View objects')

    app.unmount()
  }, 60000)

  it("renders a partner's page", async () => {
    const [partners] = await loadEntities(['partners'])
    const { app, host } = await mountOn(`#/partner/${partners[0].id}`, '.mwnf-partner-panel--full')
    expect(host.querySelector('.mwnf-partner-panel__name').textContent.trim()).not.toBe('')
    app.unmount()
  }, 60000)

  for (const page of ['about', 'credits']) {
    it(`renders the ${page} page on TextPageView`, async () => {
      const { app, host } = await mountSite(config, messages, `#/${page}`)
      expect(host.querySelector('.mwnf-prose').textContent.trim()).not.toBe('')
      app.unmount()
    }, 20000)
  }

  it("redirects legacy's addresses to their pages", async () => {
    const list = await mountSite(config, messages, '#/list/1')
    await vi.waitFor(() => expect(list.router.currentRoute.value.name).toBe('galleries'), { timeout: 20000 })
    list.app.unmount()

    // Legacy's partner address names the museum by country and legacy id.
    const [partners] = await loadEntities(['partners'])
    const swiss = partners.find((partner) => partner.backward_compatibility === 'mwnf3:museums:Mus01:sw')
    const profile = await mountSite(config, messages, '#/partner/GALLERIES/sw/Mus01/en')
    await vi.waitFor(() => expect(profile.router.currentRoute.value.name).toBe('partner'), { timeout: 20000 })
    expect(profile.router.currentRoute.value.params.id).toBe(swiss.id)
    profile.app.unmount()
  }, 60000)

  it('declares every route by name, and leaves the catch-all to the router', () => {
    // A named route is what a view links to; a path written into a link is a
    // second declaration of the same address, and the two drift.
    expect(
      checkRoutes(config, {
        names: ['home', 'galleries', 'partners', 'partner', 'about', 'credits'],
        legacyPaths: ['/list/:page?', '/partner/:database/:country/:museum/:language?'],
      }),
    ).toEqual([])
  })

  it('declares the entities every route reads', () => {
    for (const route of config.extraViews) {
      expect(Array.isArray(route.meta?.entities), route.name).toBe(true)
    }
  })

  it('declares the section every route belongs to', () => {
    expect(checkSectionMeta(config)).toEqual([])
  })

  it('publishes no generic entity pages', () => {
    expect(config.features.entities).toEqual([])
  })

  // The one language rule every website follows, read from the hub's
  // translated records: the partners, since the hub ships no items. Every
  // offered language is one the package declares for this site AND one the
  // partners' texts carry.
  it('offers the languages the package declares, where the partners carry them', () => {
    expect(checkOfferedLanguages(config, { entity: LANGUAGE_ENTITY })).toEqual([])
    expect(config.languages).toEqual(['en'])
    const switcher = config.navigation.languages
    expect(switcher.map((l) => l.code)).toEqual(config.languages)
    expect(switcher.every((l) => Boolean(l.label))).toBe(true)
  })

  // The chrome is two layers, and either one failing is silent: a missing
  // entry renders as its own name rather than as an error. This asserts the
  // rendered pages, not the files.
  it('renders the shared texts and its own over them, on every page', async () => {
    for (const [hash, selector] of [
      ['#/', '.mwnf-sibling-galleries__gallery'],
      ['#/galleries', '.hub-galleries__card'],
      ['#/partners', '.hub-partners__status'],
    ]) {
      const { app, host } = await mountOn(hash, selector)
      // From viewer-i18n: the layout's skip link.
      expect(host.textContent).toContain('Skip to content')
      expect(checkTextsRendered(host, { namespaces: ['galleries', 'core', 'layout', 'partner'] }), hash).toEqual([])
      app.unmount()
    }
  }, 90000)
})
