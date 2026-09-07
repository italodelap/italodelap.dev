# Home Experience Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move each job's `summary` into the home carousel as a panel revealed on the slide, and delete the five empty `/work-experience/[id]` detail pages it replaces.

**Architecture:** The Embla carousel, its covers and the site's glass visual system stay exactly as they are. Inside each slide, the "See more" link is replaced by a disclosure button plus a collapsed panel; the open state is a single `data-open` attribute on a new `.job` wrapper, written by a small client script and read by CSS. Hover reveal is a separate, pointer-gated CSS rule that touches no JavaScript. The carousel's client script moves from a hand-written file in `public/` that imports Embla from unpkg at runtime, to a bundled Astro `<script src="@/lib/...">` — the pattern `KeyboardShortcutInterface.astro` already uses in this repo.

**Tech Stack:** Astro 7 (SSG), TypeScript, Tailwind CSS v4, Embla Carousel 8, pnpm.

**Spec:** `docs/superpowers/specs/2026-09-04-home-experience-redesign-design.md`

## Global Constraints

- **There is no test runner in this project and none is being added.** `package.json` has no `test` script. Every task's verification is `pnpm build` (which runs `astro check` then `astro build`) plus a specific manual check in the browser. Where a task below says "verify", it means run the stated command and look at the stated output — not write a unit test.
- **Package manager is `pnpm`.** Never `npm` or `yarn`.
- **Astro starts `astro dev` as a detached background process** when it detects an AI agent, writing `.astro/dev.json`. Use `pnpm astro dev status`, `pnpm astro dev logs`, `pnpm astro dev stop` to manage it. Do not run a foreground `pnpm dev` and block.
- **Conventional Commits** for every commit message (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `style:`).
- **Path alias:** `@/*` → `src/*`. It works in processed Astro `<script src="...">` tags — `src/components/KeyboardShortcutInterface.astro` already does `<script src="@/lib/keyboard-shortcut-interface"></script>`.
- **Tailwind `dark:` variant** in this project is `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *))`, driven by `ThemeManager.astro` writing `document.documentElement.dataset.theme`. It is never `prefers-color-scheme`.
- **The `shadow` frontmatter field** (e.g. `shadow-yellow-400/50 dark:shadow-yellow-300/60`) compiles to exactly `--tw-shadow-color: <color>` and nothing else. That custom property is registered `inherits: false`, so it only works on the element that carries the class. Its companion `--tw-shadow-alpha` is registered with `initial-value: 100%`, so the colour resolves correctly without any `shadow-*` size utility present.
- **Whitespace between inline elements:** `compressHTML` uses Astro 7's `'jsx'` default. A line break between text and an inline element strips the whitespace entirely. Add `{" "}` where a space is needed. Verify visually after editing markup with adjacent inline elements.
- **Do not change `src/content.config.ts`** and do not edit any file under `src/content/work-experience/`.

---

### Task 1: Bundle the carousel script instead of loading Embla from unpkg

`public/carousel.js` is a hand-written vanilla copy of the carousel wiring that does `await import("https://unpkg.com/embla-carousel/...")` at runtime. Meanwhile `src/lib/carousel/index.ts` is the same logic in TypeScript, importing the `embla-carousel` npm package that is already in `package.json` — and nothing imports it, so it is dead code that `astro check` never exercises. This task makes the TypeScript version the real entry point.

No visual change is expected from this task. That is the point: it must be verifiable on its own before any markup changes land.

**Files:**
- Modify: `src/sections/home/experience/Carousel.astro:57` (the `<script>` tag at the end of the file)
- Delete: `public/carousel.js`
- Test: none — verified by build + browser

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: a processed Astro `<script>` in `Carousel.astro` that later tasks add a second `<script src="@/lib/experience-disclosure">` next to. `src/lib/carousel/index.ts` becomes live code, so from here on `astro check` type-checks it.

- [ ] **Step 1: Replace the script tag in `Carousel.astro`**

Find the last line of `src/sections/home/experience/Carousel.astro`:

```astro
<script is:inline src="/carousel.js"></script>
```

Replace it with:

```astro
<script src="@/lib/carousel"></script>
```

Dropping `is:inline` is what makes Astro process the script: it becomes `type="module"` (therefore deferred, so the `querySelector` calls at the top level of `src/lib/carousel/index.ts` still run against a parsed DOM), TypeScript is compiled, and `embla-carousel` is bundled from `node_modules`.

- [ ] **Step 2: Delete the public file**

```bash
git rm public/carousel.js
```

- [ ] **Step 3: Verify the build passes**

```bash
pnpm build
```

Expected: PASS. `astro check` must report `0 errors`. This is the first time `src/lib/carousel/index.ts`, `EmblaCarouselArrowButtons.ts` and `EmblaCarouselDotButton.ts` are type-checked as reachable code, so type errors surfacing here are real and must be fixed rather than suppressed.

- [ ] **Step 4: Verify the carousel still works in the browser**

```bash
pnpm astro dev status || pnpm dev
```

Open the dev server URL. On the home page confirm all four behaviours:
- the prev/next arrow buttons scroll the carousel and disable at the ends;
- the dots row renders one dot per snap point and the selected one has the darker border;
- clicking a dot scrolls to that slide;
- dragging with the mouse scrolls the carousel.

Then open DevTools → Network, reload, and filter by `unpkg`. Expected: **zero requests**. Before this change there was one.

- [ ] **Step 5: Commit**

```bash
git add src/sections/home/experience/Carousel.astro
git commit -m "refactor(carousel): bundle Embla from node_modules instead of unpkg

src/lib/carousel was dead code while public/carousel.js loaded Embla
from a CDN at runtime. Astro processes the script into a deferred
module, so the querySelector calls still run against a parsed DOM."
```

---

### Task 2: Widen the slides at large viewports

At `≥1200px` the carousel currently shows four slides, giving each about 250px of usable width. The summary panel added in Task 3 needs more than that to be legible. Three slides gives about 345px.

This is deliberately its own task so it can be judged on its own: it is a visual density change, independent of the disclosure behaviour.

**Files:**
- Modify: `src/styles/carousel.css:26` (`--slide-size-lg`)
- Test: none — verified by eye

**Interfaces:**
- Consumes: nothing.
- Produces: `--slide-size-lg: calc(100% / 3)`, which Task 3's panel sizing assumes.

- [ ] **Step 1: Change the slide size**

In `src/styles/carousel.css`, inside the `.embla { ... }` block, find:

```css
  --slide-size-lg: calc(100% / 4);
```

Replace with:

```css
  --slide-size-lg: calc(100% / 3);
```

Leave `--slide-size`, `--slide-size-sm`, and every `--slide-spacing-*` untouched. Mobile and tablet breakpoints do not change.

- [ ] **Step 2: Verify in the browser**

With the dev server running, open the home page and set the viewport to 1280px wide. Expected: three slides fully visible, with the fourth partially cut off at the right edge (the carousel uses `align: "start"`). At 1000px it should still show three (the `750px` breakpoint's `33.3%`), and at 500px one wide slide — those are unchanged.

- [ ] **Step 3: Commit**

```bash
git add src/styles/carousel.css
git commit -m "style(carousel): show three slides instead of four on large viewports

Each slide goes from ~250px to ~345px of usable width, which is what
makes the summary panel legible."
```

---

### Task 3: Replace the "See more" link with an in-slide summary disclosure

The core of the change. The slide gains a `.job` wrapper carrying `data-open`, a glow layer tinted with the company's existing `shadow` colour, a disclosure button, and a collapsed panel holding the `summary`.

**Files:**
- Create: `src/icons/ChevronUp.astro`
- Create: `src/sections/home/experience/job/Summary.astro`
- Create: `src/lib/experience-disclosure.ts`
- Modify: `src/sections/home/experience/job/Job.astro` (full rewrite)
- Modify: `src/sections/home/experience/job/Cover.astro` (class list)
- Modify: `src/styles/carousel.css` (theme variables + a new block appended at the end)
- Modify: `src/sections/home/experience/Carousel.astro` (add a second `<script>`)
- Delete: `src/sections/home/experience/job/SeeMoreButton.astro`
- Test: none — verified by build + browser

**Interfaces:**
- Consumes: `src/lib/carousel` wired as a processed script (Task 1); `--slide-size-lg: calc(100% / 3)` (Task 2).
- Produces:
  - CSS class contract, consumed only within this task and by Task 5's verification: `.job` (the state element, carries `data-open="true" | "false"`), `.job__cover`, `.job__glow`, `.job__affordance`, `.job__panel`.
  - `src/lib/experience-disclosure.ts` — a side-effecting module with no exports. It queries `[data-experience-disclosure]` buttons and toggles `data-open` on each button's closest `.job` ancestor.
  - `Summary.astro` props: `{ id: string; summary: string }`.
  - `ChevronUp.astro` props: `{ class?: string }`.

- [ ] **Step 1: Create the chevron icon**

Create `src/icons/ChevronUp.astro`. It follows the exact conventions of the existing icons in that directory (compare `src/icons/Briefcase.astro`): a `class` prop passthrough, `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, rounded caps and joins, and a leading `stroke="none"` spacer path.

```astro
---
interface Props {
  class?: string;
}

const { class: className = "" } = Astro.props;
---

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-linecap="round"
  stroke-linejoin="round"
  stroke-width="2"
  class={className}
>
  <path stroke="none" d="M0 0h24v24H0z"></path>
  <path d="M6 15l6 -6l6 6"></path>
</svg>
```

- [ ] **Step 2: Create the summary panel component**

Create `src/sections/home/experience/job/Summary.astro`.

The `job__panel` class is the hook for the state CSS added in Step 5; everything else is appearance, expressed in Tailwind so it stays visible in the markup. The glass treatment mirrors `Box.astro` but at a much higher opacity (`/85` instead of `/50`) because this panel sits over a photograph and has to carry body copy.

```astro
---
interface Props {
  id: string;
  summary: string;
}

const { id, summary } = Astro.props;
---

<div
  id={id}
  class={`
    job__panel w-full rounded-2xl
    bg-zinc-50/85 dark:bg-zinc-900/85 backdrop-blur-md
    border border-white dark:border-white/10
  `}
>
  <p
    class="p-3.5 text-xs leading-relaxed text-pretty text-neutral-800 dark:text-neutral-300"
  >
    {summary}
  </p>
</div>
```

Note there is no `hidden` attribute. The panel is hidden with `visibility: hidden` in Step 5 instead — `hidden` sets `display: none`, which cannot be transitioned and would break the CSS-only hover reveal. `visibility: hidden` removes the panel from the accessibility tree and from tab order just as effectively, and transitions correctly in both directions.

- [ ] **Step 3: Create the disclosure script**

Create `src/lib/experience-disclosure.ts`.

```ts
const DISCLOSURE_SELECTOR = "[data-experience-disclosure]";
const JOB_SELECTOR = ".job";

function toggleDisclosure(button: HTMLElement): void {
  const job = button.closest<HTMLElement>(JOB_SELECTOR);
  if (!job) { return; }

  const nextOpenState = job.dataset.open !== "true";

  job.dataset.open = String(nextOpenState);
  button.setAttribute("aria-expanded", String(nextOpenState));
}

const disclosureButtons =
  document.querySelectorAll<HTMLElement>(DISCLOSURE_SELECTOR);

disclosureButtons.forEach((button) => {
  button.addEventListener("click", () => toggleDisclosure(button));
});
```

The script deliberately does nothing on hover or focus — hover is CSS-only (Step 5), and focus does not auto-reveal. A keyboard user reaches the panel by activating the button with `Enter` or `Space`, which fires `click`, which is the standard disclosure behaviour.

> **Deviation from the spec, recorded deliberately.** The spec's accessibility section says "`:focus-visible` on the button reveals the panel". Implementing the reveal on activation instead of on focus satisfies the same requirement — the content is reachable by keyboard — and avoids panels flashing open as a user tabs past them. It also keeps `aria-expanded` truthful, which a focus-driven CSS reveal could not.

- [ ] **Step 4: Rewrite `Job.astro`**

Replace the entire contents of `src/sections/home/experience/job/Job.astro`:

```astro
---
import type { CollectionEntry } from "astro:content";

import ChevronUpIcon from "@/icons/ChevronUp.astro";

import Cover from "./Cover.astro";
import Data from "./Data.astro";
import Summary from "./Summary.astro";

type Props = Pick<CollectionEntry<"work-experience">, "id" | "data">;

const {
  id,
  data: { cover, from, position, shadow, summary, title, to },
} = Astro.props;

const panelId = `job-summary-${id}`;
---

<div class="job" data-open="false">
  <div class="absolute inset-0 -z-[1] overflow-hidden">
    <Cover cover={cover} />
  </div>
  <div class={`job__glow ${shadow}`}></div>
  <div
    class="absolute inset-0 flex flex-col items-center justify-end gap-3 px-4 py-5"
  >
    <Data from={from} position={position} title={title} to={to} />
    <button
      type="button"
      data-experience-disclosure
      aria-controls={panelId}
      aria-expanded="false"
      aria-label={`Show summary of ${title}`}
      class={`
        job__affordance size-9 shrink-0 grid place-content-center
        overflow-hidden rounded-full cursor-pointer
        text-neutral-500 dark:text-neutral-400
        bg-zinc-50/50 bg-blend-luminosity backdrop-blur-lg
        border border-white dark:border-white/10 dark:bg-zinc-900/30
        outline-1 outline-offset-0 outline-zinc-200 dark:outline-[#1a1a1a]
      `}
    >
      <ChevronUpIcon class="size-4" />
    </button>
    <Summary id={panelId} summary={summary} />
  </div>
</div>
```

Three things worth knowing about this markup:

- The button's classes duplicate `Box.astro`'s treatment rather than using `<Box as="button">`. `Box` only forwards `class`; it cannot forward `type`, `aria-*` or `data-*`, all of which this button needs.
- `shadow` is destructured and applied to `.job__glow`. That is the only element that both carries the class and draws a shadow, which is required because `--tw-shadow-color` is registered `inherits: false`.
- The body column changed from `justify-between` (which spread `Data` to the top and the old button to the bottom) to `justify-end gap-3`, so the whole group sits at the bottom and the panel grows upward from there. Padding went from `py-8` to `py-5` to buy the panel vertical room.

- [ ] **Step 5: Update `Cover.astro`**

The cover's opacity and scale now depend on the open state, so they move out of the component's class list and into `carousel.css`. Replace the markup block of `src/sections/home/experience/job/Cover.astro` (the frontmatter is unchanged):

```astro
<OptimizedImage
  src={cover.src}
  alt={cover.alt}
  class="job__cover object-cover size-full aspect-video"
/>
```

The removed classes were `opacity-60 dark:opacity-40 transition-transform group-hover:scale-110`. All four behaviours are re-established in the next step, keyed on the shared state instead of on `group-hover` alone.

- [ ] **Step 6: Add the state CSS**

Two edits to `src/styles/carousel.css`.

First, add the cover opacity variables to the two theme blocks at the top of the file, so the open-state opacity can differ per theme. Add these two lines to `:root[data-theme="light"] .embla`:

```css
  --cover-opacity: 0.6;
  --cover-opacity-open: 0.22;
```

and these two to `:root[data-theme="dark"] .embla`:

```css
  --cover-opacity: 0.4;
  --cover-opacity-open: 0.16;
```

Then add the same light-theme pair to the plain `.embla` block as a fallback, so the covers are never fully opaque during the brief moment before `ThemeManager` sets `data-theme` on `<html>`:

```css
  --cover-opacity: 0.6;
  --cover-opacity-open: 0.22;
```

The theme blocks win over this fallback on specificity (`:root[data-theme="light"] .embla` is three selectors against one), regardless of source order.

Second, append this block to the end of the file:

```css
/* ---- job slide: cover, glow and summary disclosure ---- */

.job {
  position: absolute;
  inset: 0;
}

.job__cover {
  opacity: var(--cover-opacity);
  transition: opacity 400ms ease, transform 300ms ease;
}

.job__glow {
  position: absolute;
  inset: 0;
  /* 1.8rem slide radius minus the 0.2rem border = the inner radius */
  border-radius: 1.6rem;
  pointer-events: none;
  opacity: 0;
  box-shadow: inset 0 0 34px 2px var(--tw-shadow-color);
  transition: opacity 400ms ease;
}

.job__affordance {
  transition: opacity 300ms ease, transform 300ms ease;
}

.job__panel {
  visibility: hidden;
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transform: translateY(0.75rem);
  transition:
    max-height 400ms ease,
    opacity 300ms ease,
    transform 400ms ease,
    visibility 400ms;
}

/* open, driven by the disclosure button */
.job[data-open="true"] .job__cover {
  opacity: var(--cover-opacity-open);
  transform: scale(1.1);
}

.job[data-open="true"] .job__glow { opacity: 1; }

.job[data-open="true"] .job__affordance {
  opacity: 0;
  height: 0;
  transform: scale(0.8);
}

.job[data-open="true"] .job__panel {
  visibility: visible;
  max-height: 16rem;
  opacity: 1;
  transform: translateY(0);
  overflow-y: auto;
}

/* open on hover, pointer devices only, so a tap never sticks */
@media (hover: hover) and (pointer: fine) {
  .embla__slide__content:hover .job__cover {
    opacity: var(--cover-opacity-open);
    transform: scale(1.1);
  }

  .embla__slide__content:hover .job__glow { opacity: 1; }

  .embla__slide__content:hover .job__affordance {
    opacity: 0;
    height: 0;
    transform: scale(0.8);
  }

  .embla__slide__content:hover .job__panel {
    visibility: visible;
    max-height: 16rem;
    opacity: 1;
    transform: translateY(0);
    overflow-y: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .job__cover,
  .job__glow,
  .job__affordance,
  .job__panel {
    transition-duration: 1ms;
  }

  .job__panel { transform: none; }

  .job[data-open="true"] .job__cover,
  .embla__slide__content:hover .job__cover { transform: none; }
}
```

Two notes on why this is written the way it is:

- The open-state rules are duplicated between the attribute selector and the hover selector rather than combined into one selector list, because only the hover half may sit inside the `@media (hover: hover)` query. Combining them would leak hover reveal onto touch devices.
- `visibility` is listed in the panel's `transition`. It interpolates discretely in a way that is exactly right here: opening, the panel is visible immediately; closing, it stays visible for the full 400ms and disappears at the end.
- The panel's `max-height: 16rem` is a budget, not a guess. The slide is `30rem` (480px) tall. Subtract `py-5` twice (40px), the `Data` block (64px title box + two 21px lines + two 4px margins = 114px), and the two `gap-3` gaps that survive the affordance collapsing to zero height (24px): that leaves 302px. 16rem (256px) sits inside it with 46px of slack. The longest summary renders in roughly 11 lines at `text-xs leading-relaxed` (~214px) plus 28px of padding, so it fits without scrolling — and `overflow-y: auto` is still there if a future entry runs longer.

- [ ] **Step 7: Load the disclosure script**

In `src/sections/home/experience/Carousel.astro`, add a second script tag below the one from Task 1, so the file ends with:

```astro
<script src="@/lib/carousel"></script>
<script src="@/lib/experience-disclosure"></script>
```

- [ ] **Step 8: Delete the old button**

```bash
git rm src/sections/home/experience/job/SeeMoreButton.astro
```

`Job.astro` was its only consumer, and Step 4 already removed the import. `AnimatedLink.astro`, which it used, stays — `src/sections/home/hero/Profile.astro` still uses it.

- [ ] **Step 9: Verify the build passes**

```bash
pnpm build
```

Expected: PASS, `0 errors`. If `astro check` complains that `shadow` does not exist on the destructured type, the schema in `src/content.config.ts` was changed — it should not have been; revert that instead of adjusting the type.

- [ ] **Step 10: Verify the behaviour in the browser**

With the dev server running, on the home page at a desktop width:

- hovering a slide fades the cover down, scales it up, fades in the company-coloured glow along the inside of the rounded border, hides the chevron and slides the summary panel up;
- the glow follows the rounded corners and is **not** visible outside the slide;
- each company shows a different glow colour (Mercado Libre yellow, Di Tella teal, Gov. of the City stone, Tupaca emerald, Gov. of the Nation sky);
- moving the mouse away reverses all of it;
- clicking the chevron opens the panel and it **stays** open after the mouse leaves;
- clicking again closes it;
- in DevTools, the button's `aria-expanded` and the `.job`'s `data-open` flip together;
- the Mercado Libre summary — the longest at ~490 characters — is fully readable without scrolling inside the panel at `≥1200px`.

- [ ] **Step 11: Commit**

```bash
git add src/icons/ChevronUp.astro \
        src/sections/home/experience/job/Summary.astro \
        src/lib/experience-disclosure.ts \
        src/sections/home/experience/job/Job.astro \
        src/sections/home/experience/job/Cover.astro \
        src/sections/home/experience/Carousel.astro \
        src/styles/carousel.css
git commit -m "feat(home): reveal each job summary inside its carousel slide

Replaces the 'See more' link to the empty detail page with a
disclosure panel on the slide itself. Open state is a data-open
attribute on a .job wrapper, written by a small client script and
read by CSS; hover reveal is CSS-only and gated on pointer: fine so
a tap never leaves a slide stuck open."
```

---

### Task 4: Delete the empty detail pages, the RSS feed and Prose

With the summary now on the home page, the detail route has nothing left to show. Nothing links to it after Task 3 except `/profile`, which is repointed here.

Ordering matters: this task comes **after** Task 3, so the tree is never in a state where the home carousel links to a deleted route.

**Files:**
- Delete: `src/pages/work-experience/[id].astro` (and the now-empty `src/pages/work-experience/` directory)
- Delete: `src/pages/rss.xml.js`
- Delete: `src/components/Prose.astro`
- Modify: `src/sections/profile/Experience.astro:23-30` (the `<a>` inside the `<h3>`)
- Test: none — verified by build + grep

**Interfaces:**
- Consumes: Task 3 removed the home page's only link to `/work-experience/[id]`.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Delete the three files**

```bash
git rm src/pages/work-experience/\[id\].astro
git rm src/pages/rss.xml.js
git rm src/components/Prose.astro
rmdir src/pages/work-experience
```

Verified during design, so no further checking is needed: `Prose.astro` was referenced only by `[id].astro`, where the `<Content />` call using it was already commented out; and nothing anywhere references `/rss.xml` — there is no `<link rel="alternate">` in `BaseHead.astro` and no mention in `robots.txt.ts`.

- [ ] **Step 2: Repoint the `/profile` link**

In `src/sections/profile/Experience.astro`, find:

```astro
                  <h3 class="text-lg font-semibold text-balance leading-tight">
                    <a
                      target="_blank"
                      title="Ver más"
                      class="hover:underline"
                      href={`/work-experience/${id}`}
                    >
                      {company}
                    </a>
                  </h3>
```

Replace with:

```astro
                  <h3 class="text-lg font-semibold text-balance leading-tight">
                    <a class="hover:underline" href="/">
                      {company}
                    </a>
                  </h3>
```

`target="_blank"` and `title="Ver más"` go with it: opening the site's own home page in a new tab is not intended behaviour, and "Ver más" no longer describes where the link leads. Nothing else in the file changes — the `id` still comes out of the destructuring on line 20 and is still used nowhere else, which is fine.

- [ ] **Step 3: Verify no dangling references remain**

```bash
grep -rn "work-experience/" src
```

Expected: **no output**. (`getCollection("work-experience")` calls have no trailing slash and will not match.)

```bash
grep -rn "Prose\|rss" src
```

Expected: no output.

- [ ] **Step 4: Verify the build passes and the routes are gone**

```bash
pnpm build
```

Expected: PASS, `0 errors`.

```bash
ls dist
ls dist/work-experience 2>&1
```

Expected: `dist` contains `index.html`, `resume/`, `profile/`, `robots.txt`, `sitemap-index.xml`, `sitemap-0.xml` and `_astro/`. `dist/work-experience` must not exist, and `dist/rss.xml` must not exist.

```bash
grep -c "work-experience" dist/sitemap-0.xml
```

Expected: `0`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(home): remove the empty work-experience detail pages

The /work-experience/[id] route only ever rendered the summary and
'Additional details will be available soon...'; the markdown body it
was meant to show was never written and the <Content /> call stayed
commented out. The summary now lives on the home carousel.

Drops the RSS feed with it, since every item linked to one of those
URLs, and Prose.astro, whose only consumer was that page. Repoints
the /profile links at the home page.

Not removed here: @tailwindcss/typography in global.css and the
@astrojs/rss dependency, both now unused. That is separate cleanup."
```

---

### Task 5: Verification pass — contrast, accessibility, themes, motion

The panel's contrast was explicitly **not** assumed to pass during design. This task measures it and adjusts, then walks the full accessibility and cross-theme checklist from the spec.

Use the `chrome-devtools-mcp` skill for the measurements; it is available in this project.

**Files:**
- Modify (only if a measurement fails): `src/styles/carousel.css`, `src/sections/home/experience/job/Summary.astro`
- Test: none — this task *is* the test

**Interfaces:**
- Consumes: everything from Tasks 1-4.
- Produces: the final `--cover-opacity-open` values and panel background alphas.

- [ ] **Step 1: Measure contrast on the open panel, light theme**

Start the dev server. Open the home page, force the light theme, open the Mercado Libre slide, and measure the contrast ratio of the panel's `<p>` text (`text-neutral-800`, `#262626`) against its rendered background.

Repeat for the slide with the **darkest** cover in the set, since the panel is translucent and the cover shows through. Check all five.

Required: **≥ 4.5:1** for every slide.

If any slide fails, fix it in this order and re-measure:
1. lower `--cover-opacity-open` in the light theme block of `src/styles/carousel.css` (from `0.22`, in steps of `0.04`);
2. if still failing, raise the panel background in `Summary.astro` from `bg-zinc-50/85` to `bg-zinc-50/90`, then `/95`.

- [ ] **Step 2: Measure contrast on the open panel, dark theme**

Same procedure with the dark theme, measuring `text-neutral-300` (`#d4d4d4`) against the rendered panel background. Required: **≥ 4.5:1** on all five slides.

Same fix order: `--cover-opacity-open` in the dark block (from `0.16`), then `dark:bg-zinc-900/85` → `/90` → `/95`.

- [ ] **Step 3: Check the affordance and the data block too**

While each theme is open, also confirm:
- the chevron (`text-neutral-500` light, `text-neutral-400` dark) is discernible against the resting cover — this is a non-text UI control, so the bar is **≥ 3:1**;
- the title / position / duration block still clears 4.5:1 against the *open* state's dimmed cover, which is darker than the state it was designed against.

- [ ] **Step 4: Keyboard pass**

With no mouse:
- `Tab` from the top of the page reaches each of the five disclosure buttons in carousel order;
- each has a visible focus indicator;
- `Enter` opens the panel, `Space` opens it, and both flip `aria-expanded` to `true`;
- pressing again closes it;
- no other element inside the slide is focusable (the old `See more` anchor is gone and nothing replaced it as a link).

- [ ] **Step 5: Touch pass**

Emulate a touch device (or use a real phone against the dev server on the LAN):
- tapping the chevron opens the panel;
- tapping again closes it;
- **no slide is left stuck in the open state** after swiping the carousel — this is what the `@media (hover: hover) and (pointer: fine)` gate exists to prevent, so if a slide sticks open on tap, that media query is wrong or missing;
- swiping still scrolls the carousel and the button does not swallow the drag.

- [ ] **Step 6: Reduced-motion pass**

In DevTools, Rendering → Emulate CSS `prefers-reduced-motion: reduce`. Reload. Expected: the panel appears and disappears as a fade with no upward slide, and the cover does not scale. Nothing should jump or flash.

- [ ] **Step 7: Whitespace pass**

Per the global constraint on `compressHTML`, look at the rendered panel and data block for missing or doubled spaces between inline elements — in particular the `ExperienceDuration` output inside `Data.astro`, which sits next to text and already uses `{" "}` for this reason. Fix any found by adding `{" "}` on the line that needs the space.

- [ ] **Step 8: Final build**

```bash
pnpm build
```

Expected: PASS, `0 errors`.

- [ ] **Step 9: Commit any adjustments**

Only if Steps 1-7 changed a file:

```bash
git add src/styles/carousel.css src/sections/home/experience/job/Summary.astro
git commit -m "fix(home): raise summary panel contrast to meet WCAG AA

Measured on all five covers in both themes; <values that changed>."
```

Replace `<values that changed>` with what actually changed. If nothing changed, skip this step and say so in the task report rather than committing an empty change.

---

## Done criteria

- `pnpm build` passes with `0 errors`.
- `grep -rn "work-experience/" src` returns nothing.
- No network request to unpkg on page load.
- The five summaries are readable on the home page, by mouse, by keyboard and by touch, in both themes.
- Panel body copy measures ≥ 4.5:1 on every slide in both themes.
- `dist/` contains no `work-experience/` routes and no `rss.xml`.
