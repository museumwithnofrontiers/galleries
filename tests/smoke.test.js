import { describe, expect, it } from 'vitest'
import { mergeMessages } from '@museumwnf/viewer-core'
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

describe('website smoke test', () => {
  it('mounts against the configured data package', async () => {
    const { app, host } = await mountSite(config, messages)

    expect(host.querySelector('.mwnf-page')).not.toBeNull()

    // The composed landing page (named in `config.views.home`) replaces
    // viewer-core's generic home view: the title and the cards come from
    // `config.home`, not from a page written here.
    expect(host.querySelector('.vc-home')).toBeNull()
    expect(host.querySelector('.mwnf-home__title').textContent.trim()).toBe('MWNF Galleries')
    expect(host.querySelectorAll('.mwnf-cards__card').length).toBe(config.home.cards.length)

    app.unmount()
  }, 20000)

  // The two text pages, each on an application mounted on that page's
  // address — as a visitor arrives from a link.
  for (const page of ['about', 'credits']) {
    it(`renders the ${page} page on TextPageView`, async () => {
      const { app, host } = await mountSite(config, messages, `#/${page}`)
      expect(host.querySelector('.mwnf-prose').textContent.trim()).not.toBe('')
      app.unmount()
    }, 20000)
  }

  it('declares every route by name, and leaves the catch-all to the router', () => {
    // A named route is what a view links to; a path written into a link is a
    // second declaration of the same address, and the two drift.
    expect(checkRoutes(config, { names: ['about', 'credits'] })).toEqual([])
    expect(Object.keys(config.views ?? {})).toEqual(['home'])
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
  // rendered page, not the files.
  it('renders the shared texts and its own over them', async () => {
    const { app, host } = await mountSite(config, messages)

    // From viewer-i18n: the layout's skip link.
    expect(host.textContent).toContain('Skip to content')
    expect(checkTextsRendered(host, { namespaces: ['galleries', 'core', 'layout'] })).toEqual([])

    app.unmount()
  }, 20000)
})
