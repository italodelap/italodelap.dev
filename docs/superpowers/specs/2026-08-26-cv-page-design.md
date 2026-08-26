# CV page design

## Purpose

`/resume` is a narrative, complete portfolio page — good for someone
exploring the site, not for a recruiter scanning a candidate in ten
seconds. We need a condensed, CV-formatted view of the same underlying
profile data, shareable as a URL and exportable to PDF via the
browser's print dialog, that reuses the project's existing content
(`site.json`, the `work-experience` content collection) instead of
hand-maintaining a separate PDF that goes stale every time a job
changes.

## Non-goals

- No generated static PDF artifact. "PDF" means the user hits print
  (button or Ctrl/Cmd+P) on the web page and saves it from the
  browser's print dialog.
- No Skills/tech-stack section (explicitly out of scope for this
  iteration).
- No redesign of the page currently at `/resume` (moving to
  `/profile`) beyond the route rename itself — its content, layout,
  and copy are untouched. A visual redesign of that page is a future,
  separate piece of work.
- No dark mode support on the CV page — it renders as a fixed-light
  document, matching what gets printed.
- No sitemap/robots changes for `/profile` — it loses its only
  internal link but stays technically indexable if crawled or visited
  directly.

## Route changes

- `src/pages/resume.astro` (current content, unchanged internally) is
  renamed to `src/pages/profile.astro`. Nothing inside the file
  changes — same imports, same `ResumeLayout`, same copy, same meta
  title/description (still says "Resume" despite living at
  `/profile`). This is intentional: the page is being hidden, not
  edited.
- A new `src/pages/resume.astro` is created for the CV page described
  below. `/resume` now serves the condensed CV instead of the
  narrative page.
- `src/components/header/ResumeButton.astro` already hardcodes
  `href="/resume"` — no change needed; it starts pointing at the CV
  page automatically once the route swap lands.
- Verified via grep: no other file references `/resume` as a path
  (no back-links from work-experience pages, no sitemap special-casing).
  This is the only place that needed checking.

## Data model changes

### `src/content.config.ts`

Add an optional `highlights` field to the `work-experience` schema, at
both the top level and inside `subitems`:

```ts
highlights: z.array(z.string()).optional(),
```

**The presence of `highlights` on an entry or subitem is what decides
whether it appears on the CV page (`/resume`, post-swap)**. No
separate boolean flag. If a position doesn't have `highlights`
written, it's skipped in the CV render but keeps showing normally on
`/profile`, unaffected. This keeps curation a content-authoring
decision (write bullets for the roles you want surfaced) rather than a
second field to keep in sync with the first.

Curating *which* of the 7 current positions get `highlights` (all of
them have none today) is content work to happen during
implementation, not a decision this spec locks in. The mechanism is
what's being specified here.

### `src/config/site.json`

Add a new `basics.languages` array, e.g.:

```json
"languages": [
  { "language": "English", "level": "Intermediate" },
  { "language": "Spanish", "level": "Native" },
  { "language": "Portuguese", "level": "Basic" }
]
```

Portuguese comes from working with Mercado Libre teams that speak it
day to day — worth surfacing on the CV.

### No changes needed

- `basics.about` is reused as-is for the CV's summary paragraph — no
  new field.
- `getPrintFriendlyContactChannels()` (`src/lib/contact-channels.ts`)
  already filters contact channels down to exactly email + LinkedIn —
  exactly what the CV header needs. Reused unmodified.
- `getSortedExperience()` (`src/lib/sorting.ts`) and
  `ExperienceDuration.astro` are reused unmodified for the CV's
  experience list and date formatting.

## Page structure

### `src/layouts/CvLayout.astro` (new)

Not a reuse of `ResumeLayout` — the differences are structural enough
to warrant a dedicated layout:

- No `ThemeToggler` (the page is fixed-light).
- No gradient background.
- Its own `BaseHead` title/description (CV-specific, not "Resume").
- Top bar (`print:hidden`) with `HomeButton` (existing) and the new
  `PrintButton` (see below).
- Mounts `KeyboardShortcutInterface` too, so Ctrl/Cmd+K → "Print
  resume" keeps working here as a power-user shortcut alongside the
  visible button.
- Its own `@media print` rules: page margins, `break-inside: avoid` on
  each experience entry so a bullet list doesn't split across a page
  break, hiding the top bar.

### `src/components/PrintButton.astro` (new)

A visible, `print:hidden` button (printer icon, reusing the existing
`printer.svg` asset already used by the command palette) that calls
`window.print()` on click. Stateless — plain `<button>` +
`<script>` wiring a click listener, same file shape as
`ThemeToggler.astro` but without needing a custom element (no external
state to react to).

### `src/sections/cv/` (new)

Named `cv/`, not `resume/` — that name is already taken by the
sections powering the page moving to `/profile`, and those stay
untouched per the non-goals above.

- `Header.astro` — name, label, location, contact links (email +
  LinkedIn via `getPrintFriendlyContactChannels()`).
- `Summary.astro` — renders `basics.about`.
- `Experience.astro` — iterates `getSortedExperience(workExperience)`,
  renders only entries/subitems that have `highlights`, as a bulleted
  list per position using `ExperienceDuration` for dates.
- `Education.astro` — adapted from the current one, denser spacing.
- `Languages.astro` — renders `basics.languages`.

### `src/pages/resume.astro` (new content)

Composes `CvLayout` + the five sections above, in that order (Header,
Summary, Experience, Education, Languages).

## Visual direction

Option **C** from the mockup comparison: neutral sans-serif base, a
single accent color used only for the name and section headings,
monospace reserved for dates, no per-company color-coding, no
background gradient. Denser spacing than the narrative page (now
`/profile`) — this page is meant to be scanned fast and to print
cleanly on one document flow, not necessarily one physical page,
since the curated-but-full work history from the earlier question may
still run long.

## Testing / verification

- `pnpm build` passes (type-checks the new/changed Zod schema usage
  and Astro components).
- Manual check in the browser: `/resume` renders the CV,
  `/profile` renders the untouched former resume content, the
  `ResumeButton` on the home page lands on the CV.
- Manual print preview (Ctrl/Cmd+P) on `/resume`: confirms fixed-light
  rendering, top bar hidden, no entry split across a page break, both
  the visible button and the Ctrl/Cmd+K shortcut trigger it.
- Confirm entries without `highlights` are absent from the CV's
  experience list, and that `/profile` is unaffected by the schema
  addition (optional field, no existing content breaks).
