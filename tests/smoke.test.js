import { describe, expect, it, vi } from 'vitest'
import { loadEntities, mergeMessages } from '@museumwnf/viewer-core'
import {
  checkOfferedLanguages, checkRoutes, checkSectionMeta, checkTextsRendered, mountSite,
} from '@museumwnf/viewer-core/testing'
import { catalogues as sharedTexts } from '@museumwnf/viewer-i18n/gallery'
import ownTexts from '../locales/en.json'
import config, { LANGUAGE_ENTITY } from '../src/dataset.config.js'
import { galleryIcon, galleryImage } from '../src/composables/hub.js'

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

const texts = (host, selector) => [...host.querySelectorAll(selector)].map((node) => node.textContent.trim())

describe('website smoke test', () => {
  it('mounts the home page: galleries picked from the package, and its partners', async () => {
    const { app, host } = await mountOn('#/', '.mwnf-sibling-galleries__gallery')

    expect(host.querySelector('.mwnf-page')).not.toBeNull()
    // Legacy's chrome, the gallery family's: the MWNF logo, gallery 45's
    // banner with "Welcome to" over the hub's name, legacy's menu.
    expect(host.querySelector('.mwnf-header__brand-logo').getAttribute('src')).toMatch(/\/theme\/assets\/logo\.png$/)
    expect(host.querySelector('.mwnf-banner__image').getAttribute('src')).toMatch(
      /\/theme\/assets\/chrome\/thematic_gallery\/thg_galleries\/45\/banner\.jpg$/,
    )
    // The title, then legacy's "»" to the galleries list.
    expect(host.querySelector('.mwnf-banner__title').textContent.trim()).toMatch(/^MWNF Galleries »$/)
    expect(host.querySelector('.mwnf-banner__eyebrow').textContent.trim()).toBe('Welcome to')
    expect(texts(host, '.mwnf-nav__link')).toEqual(['About', 'All Galleries', 'Partners', 'Credits'])
    // The gallery family's home block: the featured partners, each with legacy's
    // "View objects", over the galleries and the virtual museums.
    expect(host.querySelector('.hub-home.mwnf-dxa-home')).not.toBeNull()
    await vi.waitFor(() => expect(host.querySelector('.mwnf-featured-partners__more')).not.toBeNull(), { timeout: 20000 })
    expect(host.textContent).toContain('View objects >>')
    // No text of its own: legacy's home has none.
    expect(host.querySelector('.mwnf-content h1')).toBeNull()
    // Four galleries drawn at random, each with its picture from this
    // repository, and the three virtual museums' picture banners beside them.
    expect(host.querySelectorAll('.mwnf-sibling-galleries__gallery')).toHaveLength(4)
    for (const image of host.querySelectorAll('.mwnf-sibling-galleries__gallery img')) {
      expect(image.getAttribute('src')).toMatch(/\/theme\/assets\/chrome\/thematic_gallery\/thg_galleries\/\d+\/1\.jpg$/)
    }
    expect([...host.querySelectorAll('.mwnf-sibling-galleries__museum img')].map((img) => img.getAttribute('src'))).toEqual([
      expect.stringMatching(/\/theme\/assets\/dia\.jpg$/),
      expect.stringMatching(/\/theme\/assets\/dba\.jpg$/),
      expect.stringMatching(/\/theme\/assets\/sh\.jpg$/),
    ])
    expect(host.querySelectorAll('.mwnf-footer__social-link')).toHaveLength(6)
    // Each gallery links to its own site.
    for (const link of host.querySelectorAll('a.mwnf-sibling-galleries__gallery')) {
      expect(link.getAttribute('href')).toMatch(/^https:\/\/[a-z-]+\.museumwnf\.org/)
    }
    expect(texts(host, '.mwnf-footer__link')).toEqual([
      'About MWNF', 'Contact', 'Important Legal Notice', 'Credits', 'Cookies',
    ])

    app.unmount()
  }, 60000)

  it('finds a tile picture and an icon in this repository for every gallery', async () => {
    const [galleries] = await loadEntities(['galleries'])

    expect(galleries.length).toBeGreaterThan(0)
    for (const gallery of galleries) {
      expect(galleryImage(gallery), gallery.slug).toBeTruthy()
      expect(galleryIcon(gallery), gallery.slug).toBeTruthy()
    }
  })

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

  it('lists the partners as legacy did: by country name, each its badge, Read more and View objects', async () => {
    const [partners] = await loadEntities(['partners'])
    const { app, host } = await mountOn('#/partners', '.mwnf-dxa-gallery-partners__partner')

    // Legacy's own introduction, over the shared one.
    expect(host.querySelector('.mwnf-dxa-gallery-partners__intro').textContent).toContain(
      'This page is dedicated to our Partners who participate specifically in',
    )
    expect(texts(host, '.mwnf-dxa-gallery-partners__country')).toEqual([
      'Belgium', 'Italy', 'Palestine', 'Portugal', 'Qatar', 'Switzerland', 'Türkiye', 'United States of America',
    ])
    const badges = texts(host, '.mwnf-dxa-partner-badge')
    expect(badges).toHaveLength(partners.length)
    expect(badges.filter((badge) => badge === 'MWNF Galleries Affiliate')).toHaveLength(
      partners.filter((partner) => partner.level === null).length,
    )
    expect(badges.every((badge) => badge.startsWith('MWNF Galleries'))).toBe(true)
    // Every hub partner holds objects here.
    expect(texts(host, '.mwnf-dxa-gallery-partners__links a').filter((label) => label === 'View objects')).toHaveLength(
      partners.length,
    )

    app.unmount()
  }, 60000)

  it("renders a partner's page", async () => {
    const [partners] = await loadEntities(['partners'])
    const { app, host } = await mountOn(`#/partner/${partners[0].id}`, '.mwnf-partner-panel--full')
    expect(host.querySelector('.mwnf-partner-panel__name').textContent.trim()).not.toBe('')
    app.unmount()
  }, 60000)

  it("lists a partner's objects, each leading to its sheet", async () => {
    const [partners, items] = await loadEntities(['partners', 'items'])
    const turin = partners.find((partner) => partner.backward_compatibility === 'mwnf3:museums:Mus06:it')
    const { app, host } = await mountOn(`#/partner/${turin.id}/objects`, '.mwnf-dxa-gallery-objects__name')

    expect(host.querySelector('.mwnf-dxa-gallery-objects__name').textContent.trim()).toBe('Museo Nazionale dell’Automobile')
    const held = items.filter((item) => item.partner_id === turin.id).length
    expect(held).toBe(turin.item_count)
    await vi.waitFor(() => expect(host.querySelector('.mwnf-dxa-grid a[href*="/item/"]')).not.toBeNull(), { timeout: 20000 })

    app.unmount()
  }, 60000)

  it("renders an object's sheet as legacy's, linked to the gallery that shows it", async () => {
    const [items] = await loadEntities(['items'])
    const bordino = items.find((item) => item.backward_compatibility === 'mwnf3:objects:GALLERIES:it:Mus06:1')
    const { app, host } = await mountOn(`#/item/${bordino.id}`, '.mwnf-dxa-sheet, .mwnf-sheet')

    await vi.waitFor(() => expect(host.textContent).toContain('Bordino Steam Carriage'), { timeout: 20000 })
    expect(host.textContent).toContain('V 029')
    // "On display in": Historical Cars, on its new site.
    const cars = [...host.querySelectorAll('a')].find((a) => a.textContent.includes('Historical Cars'))
    expect(cars.getAttribute('href')).toBe(`https://museumwithnofrontiers.github.io/historical-cars/#/item/${bordino.id}`)

    app.unmount()
  }, 60000)

  for (const page of ['about', 'credits']) {
    it(`renders the ${page} page as a gallery's`, async () => {
      const { app, host } = await mountOn(`#/${page}`, '.mwnf-dxa-gallery-text__body')
      expect(host.querySelector('.mwnf-dxa-gallery-text__body').textContent.trim()).not.toBe('')
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

    // Legacy's partner objects and object addresses.
    const objects = await mountSite(config, messages, '#/partner-objects/GALLERIES/sw/Mus01/2')
    await vi.waitFor(() => expect(objects.router.currentRoute.value.name).toBe('partner-objects'), { timeout: 20000 })
    expect(objects.router.currentRoute.value.query).toEqual({ page: '2' })
    objects.app.unmount()

    const [items] = await loadEntities(['items'])
    const bordino = items.find((item) => item.backward_compatibility === 'mwnf3:objects:GALLERIES:it:Mus06:1')
    const sheet = await mountSite(config, messages, '#/database-item/GALLERIES/it/Mus06/1/en')
    await vi.waitFor(() => expect(sheet.router.currentRoute.value.name).toBe('item'), { timeout: 20000 })
    expect(sheet.router.currentRoute.value.params.id).toBe(bordino.id)
    sheet.app.unmount()
  }, 60000)

  it('declares every route by name, and leaves the catch-all to the router', () => {
    // A named route is what a view links to; a path written into a link is a
    // second declaration of the same address, and the two drift.
    expect(
      checkRoutes(config, {
        names: ['home', 'galleries', 'partners', 'partner', 'partner-objects', 'item', 'about', 'credits'],
        legacyPaths: [
          '/list/:page?',
          '/partner/:database/:country/:museum/:language?',
          '/partner-objects/:database/:country/:museum/:page?',
          '/database-item/:database/:country/:museum/:number/:language?',
        ],
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
  // translated records: the partners, its own records. Every
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
      ['#/partners', '.mwnf-dxa-gallery-partners__partner'],
    ]) {
      const { app, host } = await mountOn(hash, selector)
      // From viewer-i18n: the layout's skip link.
      expect(host.textContent).toContain('Skip to content')
      expect(checkTextsRendered(host, { namespaces: ['galleries', 'gallery', 'core', 'layout', 'partner'] }), hash).toEqual([])
      app.unmount()
    }
  }, 90000)
})
