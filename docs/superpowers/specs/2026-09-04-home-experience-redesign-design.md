# Home experience redesign

## Purpose

Each work-experience entry currently gets its own page at
`/work-experience/[id]`, reached from a "See more" button on the home
carousel. That page shows a hero, the `summary`, a horizontal rule and
the literal text *"Additional details will be available soon…"* — the
markdown body that was meant to fill it (`<Content />`) is commented
out and will not be written in the foreseeable future. Five routes
exist solely to promise detail that never arrives.

This redesign removes that promise. The information we already have —
`title`, `position`, `from`/`to`, `summary`, `cover` — moves into the
home carousel itself, revealed on the slide instead of on a separate
page. The carousel, the covers and the visual system stay as they are.

## Non-goals

- No new content. Nothing is written for this change: every string
  shown already exists in `src/content/work-experience/*.md`.
- No change to the `work-experience` Zod schema. `highlights` stays
  (used by `/resume`), `shadow` stays (repurposed below), `subitems`
  stays.
- No redesign of the Hero, the Header, `/resume` or `/profile`.
  `/profile` keeps its current content and layout; only one `href` in
  it changes, because the route it points at is being deleted.
- No redirects for the deleted `/work-experience/[id]` URLs. Decided
  explicitly: the pages carried no content worth preserving.
- Not addressed here, flagged during design: `mercado-libre.md` has
  `to: 2026-08-14`, so no entry reads as current, while
  `hero/Profile.astro` still shows "Available for new projects". That
  is a content decision for a separate change.

## Decisions taken during design

Recorded so the reasoning is not lost:

1. **The carousel stays.** A vertical timeline and a card grid were
   both considered and rejected as too large a change; the brief asked
   for the most conservative option that still fixes the problem.
2. **The summary is revealed in place**, as an overlay panel inside
   the slide, replacing the "See more" button — not as a card flip and
   not as an accordion below the carousel.
3. **The panel shows the `summary`, in Rubik at 12px** — not
   `highlights`, and not Space Mono. Compared as three mockups
   (A: Space Mono 13px + summary; B: Rubik 12px + summary;
   C: Rubik 12px + highlights). C is the most scannable but only three
   of five entries have `highlights` at the top level — Tupaca has
   none and Gov. of the City has them only inside `subitems` — so it
   would mix two formats in one carousel. A fits the longest summary
   (~490 characters) only just, filling the panel edge to edge. B fits
   it with room to spare, because Rubik sets roughly 35% more
   characters per line than Space Mono at the same width.
   Accepted trade-off: B breaks the "prose is Space Mono" association
   that `/profile` and `/resume` still hold.
4. **The company colour is an inner glow**, not an outer drop shadow.
   An outer `box-shadow` on the slide reads as a rectangular halo
   against the rounded frame.
5. **Three slides at `lg`, not four.** ~345px of usable width per
   slide instead of ~250px, which is what makes the panel legible.

Mockups: <https://claude.ai/code/artifact/f02e90a2-863b-4dd2-999b-c16267819433>
(page "Diseño" is the agreed design; "Alternativas evaluadas" keeps
the three panel options as a record of decision 3.)

## File changes

### Deleted

| File | Why |
| --- | --- |
| `src/pages/work-experience/[id].astro` | The empty detail page. Directory goes with it. |
| `src/pages/rss.xml.js` | Every item linked to a `/work-experience/[id]` URL that no longer exists. Decided to drop the feed rather than repoint it. |
| `src/sections/home/experience/job/SeeMoreButton.astro` | Its only consumer was `Job.astro`; the panel replaces it. |
| `public/carousel.js` | Superseded by the bundled entry point (below). |
| `src/components/Prose.astro` | Only ever referenced by `[id].astro`, where it was already commented out. |

Note: `@plugin '@tailwindcss/typography'` in `src/styles/global.css`
becomes unused once `Prose.astro` goes, and `@astrojs/rss` becomes an
unused dependency once the feed goes. Both are left in place — removing
them is cleanup that belongs to its own change.

### Added

**`src/sections/home/experience/job/Summary.astro`**

The disclosure panel. Props: `summary: string`, `id: string` (used to
build the panel's DOM `id`, so the button can reference it via
`aria-controls`). Renders a `<div>` carrying the glass treatment,
containing a single `<p>`.

**`src/icons/ChevronUp.astro`**

A stroke icon matching the existing set's conventions:
`viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`,
`stroke-width="2"`, rounded caps and joins, `class` prop passthrough.

**`src/lib/experience-disclosure.ts`**

Client-side toggle. Finds every `[data-experience-disclosure]` button,
and on click flips both `aria-expanded` on the button and `data-open`
on its slide. Nothing else — hover and focus are handled in CSS. No
side effects on import beyond attaching the listeners, so it is safe
to import from the same bundled `<script>` as the carousel.

### Modified

**`src/sections/home/experience/job/Job.astro`**

Restructured. Current markup renders `Cover`, then a flex column with
`Data` at the top and `SeeMoreButton` at the bottom
(`justify-between`). New structure, in order inside the slide:

1. `Cover` (unchanged component, new classes — see below)
2. A glow layer: an empty absolutely-positioned `div`, `inset-0`, with
   the slide's inner radius and the company colour applied as an inset
   shadow. Its colour comes from the entry's existing `shadow` field.
3. A body column with `justify-end` and `gap-3`, containing `Data`
   (unchanged component), the disclosure `<button>`, and `Summary`.

The button carries `aria-expanded="false"`, `aria-controls` pointing
at the panel's id, and an accessible name naming the company —
`Show summary of ${title}` — rather than a generic label repeated five
times. It contains a chevron icon.

**`src/sections/home/experience/job/Cover.astro`**

The opacity and scale become state-dependent rather than fixed, driven
by the slide's `data-open` attribute and by hover.

**`src/sections/home/experience/Carousel.astro`**

`<script is:inline src="/carousel.js">` becomes a processed Astro
`<script>` importing `@/lib/carousel` and
`@/lib/experience-disclosure`. Astro compiles it to `type="module"`,
which is deferred, so the `querySelector` calls in
`src/lib/carousel/index.ts` still run against a parsed DOM. Embla is
bundled from `node_modules` — the `embla-carousel` dependency is
already in `package.json` — instead of being fetched from unpkg at
runtime.

**`src/lib/carousel/index.ts`**

Currently dead code: nothing imports it. It becomes the real entry
point. Content unchanged.

**`src/styles/carousel.css`**

`--slide-size-lg` changes from `calc(100% / 4)` to `calc(100% / 3)`.
The state styles for the panel, glow, cover and affordance are added
here rather than as Tailwind classes, because they are driven by
`[data-open]` and by a `@media (hover: hover) and (pointer: fine)`
query, and this file already owns the slide's structural CSS.

**`src/sections/profile/Experience.astro:27`**

`href={`/work-experience/${id}`}` becomes `href="/"`. The
`target="_blank"` and `title="Ver más"` attributes are dropped with
it: opening your own home page in a new tab is not intended behaviour,
and "Ver más" no longer describes where the link goes. The `<a>` keeps
its `hover:underline` class and its position inside the `<h3>`. Nothing
else in the file changes.

## Interaction and accessibility

Standard disclosure pattern, with hover as progressive enhancement.

- A `<button>` is the only interactive element; it carries
  `aria-expanded` and `aria-controls`. The slide is not itself
  clickable, so there is no nested-interactive or
  click-target-without-a-role problem.
- The panel is `hidden` while collapsed, so its text is not announced
  before it is opened and not read twice.
- Hover reveal lives inside `@media (hover: hover) and (pointer: fine)`
  so a tap does not leave the state stuck open on touch devices. This
  is the same reasoning behind the current `sm:group-hover` on
  `SeeMoreButton`.
- `:focus-visible` on the button reveals the panel, so the content is
  reachable by keyboard. Five slides means five tab stops.
- Under `prefers-reduced-motion: reduce`, transitions collapse to a
  fade: no translate, no cover scale.
- The panel has a bounded height with `overflow-y: auto` as a
  safety net. With option B and three slides at `lg` the longest
  summary should not need it, but the constraint stays.

## Visual specification

Values are the ones already in the codebase unless marked NEW.

- Slide frame: unchanged — `0.2rem` border, `1.8rem` radius, `30rem`
  height.
- Cover: `opacity-60` / `dark:opacity-40` at rest — unchanged. NEW:
  drops to `opacity-[0.22]` / `dark:opacity-[0.16]` and scales to
  `1.1` when open. These are the mockup's values and are the starting
  point for the contrast measurement below, not a fixed requirement. The existing `group-hover:scale-110` behaviour is
  preserved, now tied to the same state.
- Glow (NEW): an inset shadow in the entry's `shadow` colour, on a
  layer with the slide's inner radius, faded in with the open state.
  Reuses the per-company colours already in each entry's frontmatter,
  which until now were only consumed by the deleted detail page.
- Panel (NEW): `zinc-50/85` on light, `zinc-900/85` on dark, with
  `backdrop-blur`, a `rounded-2xl` radius, and the same white /
  `white-10` border the rest of the glass surfaces use. Body copy is
  Rubik at 12px, `leading-relaxed`, in `neutral-800` / `neutral-300`.
- Affordance (NEW): a 36px circular button using the existing `Box`
  treatment, in `neutral-500` / `neutral-400`, holding the chevron.
  Fades out when the panel opens.

The panel's contrast ratio is **not** assumed to pass. It must be
measured on the rendered page, in both themes, over the darkest cover
in the set, and the cover opacity or panel alpha adjusted until body
copy clears 4.5:1.

## Testing / verification

There is no test runner in this project, so verification is `pnpm
build` plus a manual pass.

1. `pnpm build` — runs `astro check` then the build. Must pass with no
   type errors and no unresolved imports. Confirm the build output
   contains no `work-experience/` routes and no `rss.xml`.
2. Confirm no dangling references remain:
   `grep -rn "work-experience/" src` should return nothing.
3. In the browser, on `/`:
   - desktop hover opens and closes the panel on each slide;
   - `Tab` reaches every disclosure button and `:focus-visible`
     reveals the panel;
   - `Enter`/`Space` toggles it and `aria-expanded` flips;
   - at `≥1200px` three slides are visible;
   - the longest summary (Mercado Libre) is fully readable without
     scrolling inside the panel.
4. On a touch viewport: tap opens, tap again closes, and no slide is
   left stuck open after scrolling past it.
5. Both themes, via the existing `ThemeToggler`.
6. With `prefers-reduced-motion: reduce` forced on.
7. Contrast measured with Chrome DevTools on the open panel, light and
   dark.
8. Confirm the carousel still initialises — arrows, dots and drag —
   now that Embla is bundled rather than loaded from unpkg, and that
   the network tab shows no request to unpkg.
