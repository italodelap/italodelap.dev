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
- **Inter-section spacing** — the `*:mb-8` bump was reverted to `*:mb-5`
  and then tightened again to `*:mb-4` by the branch owner as part of the
  print-fit pass.
- **Spanish degree / institution names** — reviewed by the branch owner
  and adjusted (`Ingeniería de Software` → `Ingeniería en Informática`);
  no longer an open redline.
- **Experience subitem legibility** — subitem dates moved inline
  (parenthetical, smaller grey mono); the branch owner's follow-up type
  pass then took subitem text to `text-[10px]`/`text-[11px]` and dropped
  the left hairline in favour of a `pl-2` indent.

## Open findings (not fixed)

### Print overflow — confirm one-page fit before merge

The branch owner has since done the type/spacing pass this finding
called for: `*:mb-4`, section/entry `gap-3`/`gap-4`, and a global
scale-down (`text-xs` / `text-[11px]` / `text-[10px]`, `<h1>` to
`text-lg`). That pulled the CV down substantially. A rough headless DOM
measure at A4 content width still shows `/cv` `<main>` ~80px over a
~1046px one-page budget, but headless emulation is approximate — real
print margins, `break-inside: avoid`, and browser print scaling differ.
Confirm with an actual **Cmd+P preview on `/cv`** (the longer, binding
locale) before merge; if it still spills, the remaining levers are one
fewer highlight line or tighter `.resume-entry` internals.

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

Most of this list was addressed in the review-fix pass — see
"Resolved in the review-fix pass" at the end of this document. Still
open:

- `es-AR` renders `Sept 2021` (4 chars) vs 3 for every other month —
  sits slightly wide in the mono column. Cosmetic, left as-is.
- Cosmetic: `index.ts:1` path-header comment; `index.ts` education
  callback param was named `es` (renamed to `esEntry` in the fix pass).

---

## Second review pass — 2026-09-07 (`98c4321..52b1d47`)

Full re-review of the branch diff (23 files, `src/**` + skill + docs)
against `origin/main`, plus a fresh `pnpm build` and `dist/` greps.
Nothing here blocks the PR; grouped by what needs a decision vs. what
can ship as-is and be cleaned up later.

### Verified clean (no action)

- **`pnpm build`** — `astro check` 0 / 0 / 0, `astro build` 4 pages.
- **SEO tags are internally consistent.** On both routes,
  `rel="canonical"`, the three `hreflang` alternates (`en` → `/resume/`,
  `es` → `/cv/`, `x-default` → `/resume/`) and the four sitemap `<loc>`
  entries all use the `www.` host with a trailing slash. `x-default`
  correctly points at the English route.
- **No language leakage.** `dist/cv/index.html` has no English section
  titles; `dist/resume/index.html` has no Spanish. Confirmed with
  `grep`.
- **Spanish dates** render localised and capitalised with no stray
  period (`Abr 2025`, `Ago 2026`, `Sept 2021`, `Dic 2020`); English
  route unchanged (`Apr`, `Aug`, `Sep`).
- **Build-time guards hold.** `getResumeContent("es")` throws on a
  missing entry, missing top-level highlights, missing subitem
  translation, an unmatched ES subitem/education override, and on
  `education` / `languages` count drift vs `site.json`. `getFormattedDate`
  keeps its `lang = "en"` default, so its pre-existing callers are
  untouched. (After the fix pass, `getFormattedAbout` lives in
  `src/lib/about.ts` and is English-only again; the per-locale `about`
  goes through `getResumeContent`.)

### Needs a decision

- **`education[1]` degree name diverges between locales.**
  `site.json` → `"Software Engineering"`; `cv.es.ts` →
  `"Ingeniería en Informática"`. These are not translations of each
  other — they name two different degrees. The Spanish value was
  hand-picked by the branch owner, so the fix is most likely to bring
  the **English** `site.json` `education[1].area` in line (e.g.
  `"Computer Engineering"` / `"Informatics Engineering"`). Also feeds
  `/profile` and `/resume`. Decide before merge.

### Reviewed by the branch owner — keep as-is

- **`education[1]` degree name diverges between locales** — intentional.
  `site.json` keeps `"Software Engineering"`; `cv.es.ts` uses the
  official Spanish name `"Ingeniería en Informática"`. Not a bug; the
  `cv.es.ts` comment now says so.
- **Subitem role → date gap is doubled** (`{sub.position} &nbsp;`) —
  intentional. The plain space + `&nbsp;` gives the extra breathing room
  the owner wanted before the parenthetical date.
- **`work-experience/*.md` `summary:`** — the field still renders on
  `/profile` (via `profile/Experience.astro`), so it is not fully dead.
  Bringing the di-tella `summary` in line with its highlight, and
  revisiting whether the schema should still require it, are deferred.
- **`Header.astro` photo** `size-[5.625rem]` → `size-19` (90 → 76px) —
  deliberate, applied by the owner.

### Resolved in the review-fix pass (`d255f8f`, and the follow-up commit)

- **`.claude/skills/add-work-experience/SKILL.md`** — the six stale
  `/work-experience/<slug>` + RSS references (both removed in PR #8)
  corrected; the `shadow` consumer is now named as
  `home/experience/job/Job.astro`; the "current job" bullet no longer
  points at a non-existent hardcoded home line; the `Present` /
  `Actualidad` check now allows `0` and only flags `>1`. (`d255f8f`)
- **`ResumeLayout.astro` dead `Astro.site` fallback** — replaced with a
  fail-fast guard; the domain literal now lives only in
  `astro.config.mjs`. (`d255f8f`)
- **`src/lib/dates.ts` → `@/i18n/cv.es` layering violation** — `about`
  resolution moved into `getResumeContent` (new `ResumeContent.about`);
  the English-only path moved to a new `src/lib/about.ts`
  (`fillAboutTemplate` + `getFormattedAbout`). `dates.ts` no longer
  imports content and holds only date helpers. `Summary.astro` reads
  `content.about`; `Layout.astro` / `profile/About.astro` import from
  `@/lib/about`.
- **`getResumeContent` awaited per-section** — now memoised in a
  `Map<Locale, Promise<ResumeContent>>` (rejections evicted), so the
  resolver runs once per locale per build.
- **Education "zipped by index"** — `site.json` education entries and
  `cv.es.ts` education entries now carry a stable `id`
  (`graphic-multimedia-design`, `informatics-engineering`); the resolver
  matches by `id` and throws on an unmatched ES entry. The length guard
  stays.
- **Silently-ignored override `subitems` key** — `applySpanish` now
  throws `ES subitem override "<key>" of "<id>" matches no curated
  subitem` for a key that matches nothing.
- **`border-neutral-200` control contrast (WCAG 1.4.11)** —
  `LanguageSwitch` and `PrintButton` borders moved to `neutral-500`
  resting / `neutral-600` hover (~4.6:1). Verified in a browser on both
  routes — reads as a defined outline, not heavy. The remaining
  `border-neutral-200` instances are section-title underlines and the
  photo frame (decorative, not interactive-control boundaries).

### Deferred with a code comment

- **`ui.ts` routing data** (`page.title` / `switch.href` /
  `switch.hreflang`) — left in the string dictionary; a comment now
  flags that the `/resume` ↔ `/cv` pairing is duplicated across
  `ui.ts`, `ResumeLayout.astro` and the page files, and that a
  `Record<Locale, RouteInfo>` map is the shape to reach for if a third
  locale or a route rename lands.
- **Sitemap `xhtml:link` alternates** — not added. `@astrojs/sitemap`'s
  `i18n` option maps locales by path segment (`/en/x` ↔ `/es/x`); our
  routes are distinct slugs, so it doesn't fit, and a custom `serialize`
  for two URLs would duplicate the mapping already in `ResumeLayout`.
  The `<head>` `hreflang` tags are authoritative for Google on their
  own.
