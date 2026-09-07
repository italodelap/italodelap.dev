# Resume in Spanish (`/cv`)

## Purpose

The CV lives at `/resume` in English only. The site carries
`<meta name="google" content="notranslate">`, so a browser will not
machine-translate it either — a Spanish-speaking reader gets the
English document or nothing. This change adds a Spanish version at
`/cv` and lets the reader move between the two.

English stays the default: `/resume` is unchanged as a URL and is what
every existing link points at. `/cv` is the new, parallel route. There
is no language detection and no persistence — the reader lands on
English unless they follow a link to `/cv`.

The change also introduces the small i18n layer the site does not have
yet (`src/i18n/`), scoped to the CV. It is built so the rest of the
site can adopt it later without rework, but nothing outside the two CV
routes is translated here.

A second, unrelated fix rides along in the same PR: the spacing
between and within the Experience and Education sections is too tight
to read comfortably. It is a few Tailwind class changes and is cheaper
to do while this code is already open.

## Non-goals

- **No translation of the rest of the site.** The home page (`/`),
  `/profile`, the carousel, the command palette, RSS — all stay
  English. Only `/resume` and `/cv` are in scope.
- **No language detection or persistence.** No `Accept-Language`
  parsing, no `localStorage`, no cookie. Default is always English.
- **No change to `src/config/site.json`'s shape or to the
  `work-experience` Zod schema.** English keeps being read from where
  it is read today. All Spanish text is additive and lives in
  `src/i18n/`.
- **No job-title translation.** "Software Engineer", "Full Stack
  Developer", "Frontend Developer" stay in English on both routes
  (`basics.label` and every `position`). Decided during design — see
  below.
- **No redesign.** Same layout, same components, same visual system.
  The spacing changes are dial adjustments to existing classes, not a
  new design.
- **No dark mode work.** `ResumeLayout` forces light; that stays.

## Decisions taken during design

Recorded so the reasoning is not lost:

1. **Toggle mechanism: separate static route + a plain link.** English
   at `/resume`, Spanish at `/cv`. The switch is an `<a>` to the other
   route — no JavaScript, no shared DOM. Rejected: Astro's built-in
   i18n routing (restructures URLs site-wide, overkill for one page);
   a client-side toggle rendering both languages (doubles the DOM,
   fights `@media print`, and a specific language is not a shareable
   URL).
2. **The Spanish route is `/cv`, not `/resume/es` or `/es/resume`.**
   "CV" is the natural word in Spanish the way "resume" is in English;
   the two routes read as native rather than as a base plus a locale
   suffix.
3. **All Spanish text lives in `src/i18n/`; English is untouched at its
   source.** Rejected: co-locating Spanish in `site.json` (as
   `{ en, es }`) and in `work-experience` frontmatter (as
   `highlights_es` etc.). Co-location keeps a translation next to its
   source, but it changes the shape of `site.json` and the Zod schema
   that the home carousel also reads, widening the blast radius for a
   one-page feature. The accepted cost is that Spanish is detached from
   its English source and a new job needs its translation added in a
   second file — mitigated by typing the Spanish `experience` map
   against the real collection ids (see item 5).
4. **Job titles stay in English on both routes.** Keeping
   "Software Engineer" / "Full Stack Developer" / "Frontend Developer"
   untranslated is the common convention in the LatAm tech industry
   and avoids forced-sounding translations. This also means the
   Spanish `experience` map only needs to carry `highlights` and
   `company`, never `position`.
5. **The Spanish `experience` map is typed against the collection
   ids.** `cv.es.ts` declares its `experience` object
   `satisfies Record<CollectionEntry<"work-experience">["id"], …>` (or
   an equivalent keyed type) so a misspelled or missing id is an
   `astro check` failure, which already runs in `pnpm build`.
6. **Proper nouns are translated only where a real Spanish name
   exists.** "Government of the Argentine Nation" →
   "Gobierno de la Nación Argentina"; "Government of the City of
   Buenos Aires" → "Gobierno de la Ciudad de Buenos Aires";
   "Torcuato Di Tella University" → "Universidad Torcuato Di Tella";
   "University of Morón" → "Universidad de Morón". Brand names
   (Mercado Libre, Tupaca) and the person's name are left as-is.
7. **The `add-work-experience` skill is updated in this PR.** Adding a
   job now has a sixth place to touch (`src/i18n/cv.es.ts`); the skill
   that exists specifically to make a job change a single clean pass
   must say so, or the Spanish CV silently rots on the next job change.

## Routing

| Language | Route | File | Notes |
|---|---|---|---|
| English (default) | `/resume` | `src/pages/resume.astro` | Unchanged except passing `lang="en"` down |
| Spanish | `/cv` | `src/pages/cv.astro` | New; same composition, `lang="es"` |

`cv.astro` is a near-copy of `resume.astro`: it renders
`<ResumeLayout lang="es">` wrapping the same five sections, each given
`lang="es"`. `resume.astro` gains an explicit `lang="en"`.

Both pages emit, in `<head>`, the full set of `hreflang` alternates:

```html
<link rel="alternate" hreflang="en" href="https://www.italodelap.dev/resume" />
<link rel="alternate" hreflang="es" href="https://www.italodelap.dev/cv" />
<link rel="alternate" hreflang="x-default" href="https://www.italodelap.dev/resume" />
```

`canonical` stays per-page (already handled by `BaseHead` from
`Astro.url.pathname`).

## The i18n layer

```
src/i18n/
  ui.ts        UI strings, both locales
  cv.es.ts     Spanish CV content (overrides for site.json + frontmatter)
  index.ts     getResumeContent(lang) — resolves the final shape
```

### `ui.ts`

A flat dictionary keyed by locale. Keys (values are the starting
translations; exact wording is open to redline):

| Key | `en` | `es` |
|---|---|---|
| `section.summary` | `Summary` | `Perfil` |
| `section.experience` | `Experience` | `Experiencia` |
| `section.education` | `Education` | `Educación` |
| `section.languages` | `Languages` | `Idiomas` |
| `date.present` | `Present` | `Actualidad` |
| `page.title` | `Italo De la Peña \| Resume` | `Italo De la Peña \| CV` |
| `page.description` | `Italo De la Peña's resume.` | `El CV de Italo De la Peña.` |
| `print.label` | `Print CV` | `Imprimir CV` |
| `switch.toEs` | `Español` | — |
| `switch.toEn` | — | `English` |

Typed `as const`; a `useTranslations(lang)` helper returns
`(key) => ui[lang][key]` for terse call sites.

Note: `page.title` moves the English CV from its current hardcoded
`Italo De la Peña | CV` (in `ResumeLayout`) to `Italo De la Peña |
Resume`, so the two routes read naturally in their own language. This
is a deliberate, redline-able consequence — if the English title
should stay `| CV`, set both `en` and `es` to it.

### `cv.es.ts`

Spanish only. English keeps being read from `site.json` and the
collection.

```ts
export const cvEs = {
  label: "Software Engineer",            // English, per decision 4
  about: "Soy Ingeniero de Software con más de [years] años de experiencia…",
                                         // keeps the literal [years] placeholder
  location: { city: "Buenos Aires", country: "Argentina" },
  languages: [
    { language: "Inglés",    level: "Intermedio" },
    { language: "Portugués", level: "Básico" },
    { language: "Español",   level: "Nativo" },
  ],
  education: [
    {
      area: "Tecnicatura Superior en Diseño Gráfico y Multimedial",
      institution: "Instituto de Educación Técnica Superior N.º 27",
      notes: "1.º a 2.º año",
    },
    {
      area: "Ingeniería en Informática",
      institution: "Universidad de Morón",
      notes: "1.º a 3.º año",
    },
  ],
  experience: {
    "argentina": {
      company: "Gobierno de la Nación Argentina",
      highlights: [ /* ES */ ],
    },
    "di-tella":      { company: "Universidad Torcuato Di Tella", highlights: [ /* ES */ ] },
    "mercado-libre": { company: "Mercado Libre",                 highlights: [ /* ES */ ] },
    "tupaca":        { company: "Tupaca",                        highlights: [ /* ES */ ] },
    "buenos-aires": {
      company: "Gobierno de la Ciudad de Buenos Aires",
      subitems: {
        // keyed by the position string (English, unique within the job)
        "Frontend Developer":   [ /* ES highlights */ ],
        "Full Stack Developer": [ /* ES highlights */ ],
      },
    },
  },
} as const;
```

The `experience` object is typed against the real collection ids so
`astro check` catches drift (decision 5). `education` and `languages`
are ordered to match the English arrays position-for-position (they
are zipped by index in `index.ts`).

The five entries that render on the CV — confirmed against
`Experience.astro`'s filter (`hasHighlights(job) || curatedSubitems`):
`argentina`, `di-tella`, `mercado-libre`, `tupaca` (top-level
highlights), and `buenos-aires` (two curated subitems: "Frontend
Developer" and "Full Stack Developer"; the "Assistant to the Cabinet
Chief" subitem has no highlights and is filtered out).

Full English → Spanish highlight text is drafted during
implementation and reviewed in the PR, not pinned in this spec.

### `index.ts`

```ts
getResumeContent(lang: "en" | "es"): ResumeContent
```

Returns one already-resolved shape for the sections to render:
`{ label, about, location, languages, education, experience }` where
`experience` is the sorted, filtered, curated list
(`getSortedExperience` + `hasHighlights` + subitem curation) that
currently lives inline in `Experience.astro`. That logic moves here so
both languages build the list identically and the `.astro` files
become dumb views.

- `lang === "en"` → values from `site.json` + `getCollection`, list
  built as today.
- `lang === "es"` → same list, but each entry's `company` and
  `highlights` (and each curated subitem's `highlights`) replaced from
  `cvEs.experience`; `about`, `education`, `languages`, `location`
  replaced wholesale from `cvEs`.

If an id is present in the collection but missing from
`cvEs.experience`, that is a type error at build (decision 5); at
runtime `getResumeContent` may still throw a clear error rather than
silently falling back to English, so a gap is impossible to miss.

## Component changes

- **`ResumeLayout.astro`** — new prop `lang: "en" | "es"`. Sets
  `<html lang={lang}>`, passes translated `title` / `description` to
  `BaseHead`, renders the `hreflang` block, passes `lang` to
  `PrintButton` and to the new `LanguageSwitch`.
- **`LanguageSwitch.astro`** (new) — receives `lang`. On `/resume`
  renders `<a href="/cv">Español</a>`; on `/cv` renders
  `<a href="/resume">English</a>`. Sits in the existing
  `fixed top-4 right-4 … print:hidden` cluster next to `PrintButton`
  (and carries its own `print:hidden` if rendered as a sibling
  outside that wrapper). **Must not be visible when printing** —
  explicit requirement.
- **`PrintButton.astro`** — new prop `lang`; `aria-label` / `title`
  come from `ui[lang]["print.label"]`.
- **`Header`, `Summary`, `Experience`, `Education`, `Languages`** — each
  gains a `lang` prop and reads from `getResumeContent(lang)` +
  `useTranslations(lang)` instead of importing `site.json` directly.
  Markup is unchanged except for the spacing pass below.
- **`lib/dates.ts`**
  - `getFormattedDate(date, lang)` →
    `Intl.DateTimeFormat(lang === "es" ? "es-AR" : "en-US", { month: "short", year: "numeric", timeZone: "UTC" })`.
    Produces `sept 2021` instead of `Sep 2021`.
  - `getFormattedAbout(lang)` → picks `cvEs.about` or `basics.about`,
    same `[years]` substitution.
  - The `"Present"` literal leaves `ExperienceDuration.astro` and comes
    from `ui[lang]["date.present"]`; that component gains a `lang`
    prop.
- **`src/pages/resume.astro`** — pass `lang="en"` to layout and
  sections.
- **`src/pages/cv.astro`** (new) — same as `resume.astro` with
  `lang="es"`.

## Spacing pass

Current values and the starting proposal. These are dials — if the
printed page overflows to a second sheet, they come back down step by
step. `.resume-entry` already has `break-inside: avoid` under
`@media print`.

| Where | Now | Proposed |
|---|---|---|
| Between sections — `resume.astro` / `cv.astro` `<main>` | `*:mb-5` (1.25rem) | `*:mb-8` (2rem) |
| Between jobs — `Experience.astro` `<ul>` | `gap-2` (0.5rem) | `gap-4` (1rem) |
| Title → content — `Experience.astro` `<ResumeSection>` | `gap-2` | `gap-3` (0.75rem) |
| Between studies — `Education.astro` `<ul>` | `gap-1.5` (0.375rem) | `gap-4` (1rem) |
| Title → content — `Education.astro` | `gap-1.5` | `gap-3` |
| Inside a single entry (`article` `gap-0.5`) | 0.125rem | unchanged (tight on purpose) |

Both routes get the change. `/cv` is the binding constraint for the
single-page check because Spanish runs longer than English.

## `add-work-experience` skill update

`.claude/skills/add-work-experience/SKILL.md` is in the repo; editing
it is a normal file change in this PR.

- Its step 5 ("Update the profile-wide 'current job' mentions") lists
  the places outside the content collection that mention the job. Add
  `src/i18n/cv.es.ts` as another: when opening a job, add its id to
  the `experience` map with the Spanish `company` and `highlights`
  (and `subitems` if the job has multiple roles); when closing a job,
  its Spanish highlights do not change, same as the English side.
- Note that `astro check` (already in the verification step) fails if
  the new id is missing from `cvEs.experience`, because the map is
  typed against the collection ids.
- Extend the skill's Verification section to also load `/cv` and
  confirm the new entry renders in Spanish, and that `/cv` shows
  exactly one "Actualidad" (the Spanish counterpart of its existing
  "exactly one `Present`" check on `/resume`).

## Testing / verification

1. **`pnpm build`** — `astro check` then `astro build`, 0
   errors/warnings. `astro check` validates the `cv.es.ts` typing
   against the collection ids.
2. **Exactly one "current" marker per route** —
   `grep -o Present dist/resume/index.html | wc -l` → `1`;
   `grep -o Actualidad dist/cv/index.html | wc -l` → `1`.
3. **`pnpm preview` + Chrome DevTools MCP** (light theme, which
   `ResumeLayout` forces):
   - `/resume` — five sections in English; `LanguageSwitch` reads
     "Español" and links to `/cv`.
   - `/cv` — all content in Spanish; dates formatted `es-AR`
     ("sept 2021"); `LanguageSwitch` reads "English" and links to
     `/resume`.
   - **Print emulation on both** — content fits one page;
     `LanguageSwitch` and `PrintButton` are not rendered
     (`print:hidden`).
   - `<head>` of both carries the three `hreflang` alternates.
   - `astro` is not on `PATH` directly — use
     `pnpm exec astro preview status` / `… stop`, and stop the
     background server when done.
4. **Inline whitespace** — visual check of any markup touched, per the
   `compressHTML: 'jsx'` gotcha in `CLAUDE.md` (`ExperienceDuration`
   already uses `{" "}`).
5. **Accessibility** — `<html lang>` correct on each route;
   `LanguageSwitch` is a real `<a>` with discernible text and an
   accessible name that states the target language; no contrast
   regression against the white background.

## Delivery

Trunk-based, per `AGENTS.md`. Branch `feat/resume-i18n` off `main`,
commit, push, open a PR, wait for the `build` check. **Do not merge
without Italo's explicit go-ahead** — plan approval and merge approval
are separate.
