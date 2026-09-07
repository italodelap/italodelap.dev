# Spanish CV (`/cv`) — verification & open findings

Branch `feat/resume-i18n`, commits `98c4321..52bcf4a`. Plan:
`2026-09-07-resume-i18n.md`. Spec: `../specs/2026-09-07-resume-i18n-design.md`.

All 9 plan tasks were implemented and individually reviewed. This
document records the end-to-end verification pass and the findings that
are **not yet fixed** — deferred per the instruction to document
post-implementation bugs and address them separately.

## What passed

- **`pnpm build`** — `astro check` 0 errors / 0 warnings / 0 hints;
  `astro build` builds 4 pages; `dist/resume/index.html` and
  `dist/cv/index.html` both exist.
- **No language leakage either way.** `/cv` has no English section
  titles and no `"Present"`; `/resume` has no Spanish. Checked beyond
  the greps: `alt` text (the person's name, language-neutral),
  `datetime` attributes (ISO), `og:`/`twitter:` tags (derive from the
  translated `title`/`description`), contact channels (email + URL).
- **`/resume` render is byte-identical to `main`** except the `<title>`
  (`| CV` → `| Resume`) — the `lang="en"` path through
  `getResumeContent` / `useTranslations` / locale-aware dates
  reproduces the previous page exactly. The old inline curation in
  `Experience.astro` moved into `getResumeContent` with no behavioral
  change.
- **`getFormattedDate` / `getFormattedAbout` are backward-compatible.**
  Both take an optional `lang` defaulting to `"en"`; all six untouched
  call sites (`Layout.astro`, `profile/About.astro`,
  `home/experience/job/Data.astro`, `profile/Experience.astro` ×2,
  `profile/Education.astro`) produce identical output.
- **`BaseHead` `alternates` is safely additive** — default `[]` renders
  nothing; no other page emits `rel="alternate"`.
- **Build-time safety net works.** `getResumeContent("es")` throws
  `Missing ES translation for work-experience entry "<id>"` (and a
  per-subitem variant) — a new highlighted `buenos-aires` subitem would
  fail `astro build`.
- **`print:hidden` verified.** Under print-media emulation the whole
  top-right control cluster (language switch + printer) computes to
  `display: none` on both routes.
- **Spanish content.** Company names translated on `/cv`
  ("Gobierno de la Nación Argentina", "Universidad Torcuato Di Tella",
  "Gobierno de la Ciudad de Buenos Aires"); job titles stay English
  ("Full Stack Developer", …); dates render Spanish and capitalized
  ("Abr 2021", "Ago 2016", "Sept 2021"); em-dash spacing intact; no
  run-together text.
- **`LanguageSwitch` a11y** — real `<a>` with discernible text naming
  the target language, `lang`/`hreflang` on it, keyboard-focusable;
  label text is `text-neutral-600` on white (7.4:1, AAA).
- **Diff scope** — `src/config/site.json`, `src/content.config.ts`, and
  `src/content/work-experience/*` are **not** touched.

## Open findings (not fixed)

### Print overflow — the plan's Task 7 gate did not pass

`/cv` and `/resume` both print to **two A4 pages** (`@page { margin:
1cm }`). Measured with print-media emulation at A4 content width:

| route | `<main>` height, this branch | with the 6 spacing tokens reverted | budget (1 page) |
|---|---|---|---|
| `/resume` | ~1176px | ~1064px | ~1047px |
| `/cv` | ~1208px | ~1096px | ~1047px |

- The spacing pass (commit `037e90a`) added **+112px on both routes**.
- With the pass reverted, `/resume` is still ~17px over — it was
  **already 2 pages on `main`**, marginally. `/cv` (new, longer
  Spanish text) is ~50px over even reverted.
- The plan's documented dial-down (`*:mb-8`→`mb-7`, Experience &
  Education `<ul>` `gap-4`→`gap-3`) only recovers ~40px. A genuine
  one-page result needs **structural** trimming — tighter
  `.resume-entry` internals, a smaller base rhythm (`*:mb-4`/`mb-3`),
  or dropping a highlight line — followed by re-measuring `/cv`, which
  is the binding constraint.

### Regression: the control cluster covers the `<h1>` on phones

`src/layouts/ResumeLayout.astro` — on `main` the fixed top-right cluster
was just `<PrintButton>` (~40px, left edge ≈ 319px at 375px width) and
cleared the name. Adding `<LanguageSwitch>` grew it to ~120px:

| viewport | route | cluster left edge | `<h1>` glyphs end | result |
|---|---|---|---|---|
| 375px | `/cv`, `/resume` | ~238px | ~304px | ~65px of the surname hidden ("Italo De la …") |
| 320px | both | ~183px | ~304px | whole `<h1>` overlapped |
| ≥768px | both | — | — | no overlap |

Fix (any one): a small-screen top offset on the header / `<main>`
(`pt-14 sm:pt-4`, `mt-12 sm:mt-0`); render the cluster inline above the
header below `sm:`; or a compact `ES`/`EN` label under `sm:`. Add a
375px step to the visual-check list.

### Silent English fallback for top-level highlights

`src/i18n/index.ts` — `highlights: override.highlights ?? entry.highlights`.
`ExperienceOverride.highlights` is optional, so an override that gives
only `company` (the shape `buenos-aires` has today) would render
**English** highlights on `/cv` if that entry's `.md` had top-level
`highlights`. Not triggered today. The adjacent subitem path *throws*
for the same gap — this one should too:
`if (entry.highlights.length > 0 && !override.highlights) throw …`.

### `hreflang` alternates don't match canonical / sitemap

`src/layouts/ResumeLayout.astro` emits `href=".../resume"` (no trailing
slash) while `canonical` and `sitemap-0.xml` use `.../resume/`. hreflang
annotations should point at canonical URLs. Fix:
`new URL("/resume/", site)` / `new URL("/cv/", site)`.

### `/profile` and `/resume` now share a `<title>`

The Task 6 flip made `/resume`'s title `Italo De la Peña | Resume`,
which is identical to `ProfileLayout.astro`'s hardcoded title. Both are
in the sitemap. Decide: keep the English CV title as `| CV`, or retitle
`/profile`.

### `/resume` meta description shrank to a stub

`src/i18n/ui.ts` — `en: "Italo De la Peña's resume."` (26 chars)
replaced the previous 110-char recruiter-facing sentence, which also
fed `og:description` / `twitter:description` (LinkedIn/Slack/X previews).
The old text's "more than 8 years" was stale — write a fresh English
description plus a Spanish counterpart rather than restoring it.

### `education` / `languages` zipped by index with no guard

`src/i18n/index.ts` — `from: education[i].from`. If `site.json`'s
`education` is reordered, `/cv` shows the wrong dates against the right
degree; if it grows, `/cv` renders fewer entries or the build dies with
a bare `undefined`. `languages` is taken wholesale from `cvEs`, never
compared to `basics.languages` (the `cv.es.ts` comment claiming
"zipped by index" is inaccurate). Add length assertions with named
throws.

### Redline: unverified Spanish degree / institution names

Still need a human check against the official names:
- `"Ingeniería de Software"` — the spec sketch had proposed
  `"Ingeniería en Informática"`; two different guesses, neither
  verified.
- `"Tecnicatura Superior en Diseño Gráfico y Multimedial"`
- `"Instituto de Educación Técnica Superior N.º 27"`

### Minor / polish

- `ui.ts` `switch.href` / `switch.hreflang` are routing data encoded
  per source locale — structurally breaks with a third locale. A
  `Record<Locale, string>` route map would be cleaner.
- `getResumeContent(lang)` is awaited 4× per page (once per section);
  `getCollection` is memoized so it's cheap, but a module-level memo
  keyed by `lang` is three lines.
- `src/lib/dates.ts` now imports `@/i18n/cv.es` — a date utility
  holding a locale content branch. `getFormattedAbout` was already
  misplaced; moving `about` into `getResumeContent` would restore the
  layering.
- An override `subitems` key matching no curated subitem is silently
  ignored (typo'd position string).
- `border-neutral-200` on white (~1.2:1) fails WCAG 1.4.11 for the
  control boundary — pre-existing on `PrintButton`, inherited by
  `LanguageSwitch`.
- `es-AR` renders `Sept 2021` (4 chars) vs 3 for every other month —
  sits slightly wide in the mono column. Cosmetic.
- Cosmetic: `index.ts:1` path-header comment; `index.ts` education
  callback param named `es`; the inaccurate `cv.es.ts` "zipped by
  index" comment.
