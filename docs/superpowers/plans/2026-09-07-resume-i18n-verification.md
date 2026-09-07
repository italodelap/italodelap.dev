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

## Resolved after the verification pass

Commits `83e947d`, `0c784e0`, `6a3a706` (branch iteration, in the PR):

- **`/profile` vs `/resume` `<title>` collision** — `/profile` retitled
  `Italo De la Peña | Profile`. The three CV-ish routes now have distinct
  titles (`| Resume` / `| CV` / `| Profile`).
- **Meta description stub** — `/resume` and `/cv` `page.description` in
  `ui.ts` replaced with full recruiter-facing copy (EN + ES); `/profile`'s
  stale "8 years" description refreshed. These feed `og:`/`twitter:` too.
- **Inter-section spacing** — the `*:mb-8` bump reverted to `*:mb-5`
  (matches `main`), removing most of the +112px the spacing pass added.
- **Spanish degree / institution names** — reviewed and confirmed
  correct as written; no longer an open redline.
- **Experience subitem legibility** — subitem dates moved inline
  (parenthetical, smaller grey mono), highlight bullets to 11px, left
  hairline on the subitem group.

## Open findings (not fixed)

### Print overflow — still needs structural work

Both routes still print past one A4 page. The `*:mb-5` revert plus the
subitem compaction pulled the overshoot down (rough DOM measure at A4
content width: `/cv` `<main>` ≈ 1134px vs a ~1046px one-page budget, so
~90px over; `/resume` a little less). A reliable one-page fit still needs
**structural** trimming — tighter `.resume-entry` internals, a smaller
base rhythm, or one fewer highlight line — re-measured against `/cv`,
which is the binding constraint. Deferred by the branch owner.

### Print overflow — original measurements (pre-revert)

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

### Regression: the control cluster covered the `<h1>` on phones — FIXED

Fixed in `782effc`: the cluster is now `static` below `sm:` (flows above
the header) and `sm:fixed` top-right from `sm:` up. Re-checked at 375px —
no overlap, header and controls stack cleanly.

### Fixed in `782effc` (fix wave)

- **Silent English fallback for top-level highlights** — `applySpanish`
  now throws `Missing ES highlights for work-experience entry "<id>"`
  when a rendered entry has EN highlights and no ES override
  (`src/i18n/index.ts:102`).
- **`hreflang` didn't match canonical / sitemap** — now
  `new URL("/resume/", site)` / `new URL("/cv/", site)`, trailing slash
  consistent (`src/layouts/ResumeLayout.astro:25`).
- **`education` / `languages` zipped by index with no guard** — length
  assertions with named throws added (`src/i18n/index.ts:138`).

### Fixed in branch iteration (`0c784e0`)

- **`/profile` / `/resume` shared `<title>`** — `/profile` retitled
  `| Profile`.
- **`/resume` meta description stub** — full EN + ES copy written in
  `ui.ts`; `/profile`'s stale line refreshed.
- **Unverified Spanish degree / institution names** — reviewed by the
  branch owner, confirmed correct as written.

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
