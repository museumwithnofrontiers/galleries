# MWNF Galleries

The galleries hub of Museum With No Frontiers: every MWNF gallery, and the
Partners of the *MWNF Galleries* project. It replaces
<https://galleries.museumwnf.org>.

Live at <https://museumwithnofrontiers.github.io/galleries/>.

It is a light, static Vue 3 front-end on the MWNF website platform, created
from [`website-template`](https://github.com/museumwithnofrontiers/website-template)
(class `standalone`) and built from these `@museumwnf` packages on npmjs:

| Package | Role |
| --- | --- |
| `@museumwnf/galleries-data` | the hub's data: the galleries it lists and its partner directory |
| `@museumwnf/viewer-core` | application engine (routing, data access, texts, language) |
| `@museumwnf/viewer-layout` | page structure and the shared components, themed via `theme/tokens.css` |
| `@museumwnf/viewer-i18n` | the shared texts |

## What the hub shows

| Page | Address | What it shows |
| --- | --- | --- |
| Home | `#/` | Four galleries picked at random, the three MWNF virtual museums, and three partners picked at random. Legacy drew both picks per request. |
| Galleries | `#/galleries` | Every gallery: the count, a list to jump to one, an A–Z / Z–A toggle, four featured at random, then the grid with each gallery's icon. Every gallery links to its own site. |
| Partners | `#/partners` | The partner directory, grouped by country, each marked Partner or Affiliate |
| A partner | `#/partner/<id>` | The partner's profile |
| About, Credits | `#/about`, `#/credits` | Legacy's texts |

Legacy's addresses still work: `#/list` and `#/list/<page>` open the galleries
page, and `#/partner/<database>/<country>/<museum>/<language>` opens that
partner.

**What the hub does not show.** The hub ships no items: no item sheets, no
partner objects and no timeline (decided on 2026-09-28, inventory-app#1744).
Each gallery's own site carries those. The data package is specified in
inventory-app's
[`scripts/exporters/docs/galleries-hub-data-package.md`](https://github.com/museumwithnofrontiers/inventory-app/blob/main/scripts/exporters/docs/galleries-hub-data-package.md).

## Where things are

- **`src/dataset.config.js`:** the whole declaration: routes, languages, menu, legacy addresses.
- **`src/composables/hub.js`:** the hub's records and what it derives from them (names, links, random picks, the partner view).
- **`src/views/`:** the home page, the galleries list, the partner list and the partner page, composed from viewer-layout's shared components.
- **`src/assets/galleries/`:** each gallery's icon, named after the gallery's legacy key. These are legacy's own pictures, which only ever lived in its client.
- **`locales/en.json`:** the hub's own texts. About, Credits and the partners intro come from legacy.

The hub is English only: legacy carried its own texts in English alone. The
offered languages follow the one platform rule, read from the partners' texts
because the hub has no items.

---
## Translator — editing the website's texts

You only need a GitHub account and a browser. The files under `locales/` hold
**this website's own texts**, one file per language — `en.json` is English,
`fr.json` French, and so on.

Texts shared with the other websites of the same kind — the labels of an item
sheet, the navigation, the buttons — are not here: they live in
[`viewer-i18n`](https://github.com/museumwithnofrontiers/viewer-i18n) and are edited there,
the same way. This website can override any of them by writing the same entry
name in its own file. The museum content itself arrives already translated and
is not edited anywhere.

1. **Open the folder.** Bookmark this link on the website's GitHub page:
   `locales/`. Click the language file you want to change.
2. **Click the pencil** (✏️, top right of the file view). The file opens in an
   editable text box. Change only the text between the second pair of
   quotation marks on a line — the part before the colon is the name of the
   entry and must stay exactly as it is.
3. **To start a new language**, open `en.json`, copy all of its content, then
   create the new file (Add file → Create new file) named with the two-letter
   language code, e.g. `ar.json`, paste, and translate the texts. A language
   does not have to be complete: anything you have not translated shows in
   English.
4. **Click "Commit changes…" then "Propose changes".** GitHub asks nothing
   else — it saves your edit as a proposal.
5. **Wait for the automatic check.** After a minute or two, the proposal page
   shows a green tick and your change goes live on the website by itself a few
   minutes later. If something is off, a comment appears explaining in plain
   language what to fix — edit again on the same page and the check reruns.

A text is **just text**, formatted with Markdown if you want: `**bold**`,
`*italic*`, `[a link](https://example.org)`. It may not contain HTML tags, and
it may not contain `{` or `}` — nothing is ever inserted into a text, so a
number or a date is placed next to it by the website rather than inside it.

---


---

## Webdesigner — theming the website

The website's whole visual identity lives in the `theme/` folder:
`tokens.css` (colors, fonts, spacing — the normal surface), `overrides.css`
(escape hatch) and `assets/` (logo, banner, sponsor images). Small changes can
be made straight in the browser with the pencil button, like the translator
flow above — styling changes are reviewed, they do not merge automatically.
For real design work, use the live preview:

1. **One-time setup:**
   - Install **Docker Desktop** (docker.com) and **GitHub Desktop**
     (desktop.github.com), each with default settings.
   - In GitHub Desktop: File → Clone repository → pick this website's repo.
   - No npm login is needed: every `@museumwnf` package installs anonymously
     from npmjs. Nothing in this repository holds a token.
2. **Start the preview:** open a terminal in the folder (GitHub Desktop:
   Repository → Open in Command Prompt) and run:

   ```bash
   docker compose up
   ```

   The first start downloads everything and takes a few minutes; wait until a
   line shows `Local: http://localhost:5173/`, then open
   **http://localhost:5173** in your browser.
3. **Edit `theme/`, watch it live.** Every save refreshes the browser
   automatically. `tokens.css` lists every knob with a comment; put images
   into `theme/assets/` and reference them from `src/dataset.config.js`
   (banner, sponsor logos). Anything a token cannot express goes into
   `overrides.css`. A change to a layout component itself is a request for the
   `viewer-layout` package — open an issue there and a developer pairs on it.
4. **Propose your changes:** in GitHub Desktop, write a short summary bottom
   left → **Commit** → **Push origin** → **Create Pull Request** (opens in the
   browser → green **Create pull request** button). After a colleague approves
   it, the change merges and deploys by itself. Stop the preview with
   `Ctrl+C` in the terminal when done.

---

---

## Developer notes

Develop and test in Docker, like every MWNF website:

```bash
docker compose up
docker compose run --rm dev npm test
```

The smoke test (`tests/smoke.test.js`) mounts every page against the real data
package: the galleries list against every gallery the package carries, the
partner directory against every partner with its status, and both legacy
redirects.

---

## Licence

This website is Content of the MWNF Website under the [MWNF legal
notice](https://www.museumwnf.org/about/legal-notice), which governs its use
(non-commercial, personal, educational and scientific use is permitted, with
attribution and mandatory reporting — see the notice for the full terms). The
notice text also ships in this repository as `LICENSE.md`.

