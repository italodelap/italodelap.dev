---
name: add-work-experience
description: Add a new job to Italo's work-experience content collection and close out the previous current job, or update the site's "currently working at" copy after a job change. Use this whenever the user says they started a new job, changed roles, wants to add a company to their resume/portfolio, mentions a new position at a company, or asks to update their profile after a career change — even if they only mention the new company name and start date and don't explicitly ask for a "work experience entry." Also use when asked to fix broken links on the home page, dates that look wrong on /resume, or the profile's "About" text.
---

# Add a work experience entry

## Why this exists

This skill was written after adding the "Mercado Libre" entry to italodelap.dev and closing out "Torcuato Di Tella University" as the previous job. That session took multiple rounds because the site has **five places that mention the current job**, only one of which is the content collection itself. Follow this checklist so a job change is a single clean pass instead of a multi-round investigation.

## The mental model

Adding a job is really **two operations that must happen together**:

1. **Open** a new entry for the new job.
2. **Close** the entry that was previously "current" (no `to` date) — otherwise the resume shows two jobs saying "Present" at once, which is the most common mistake here.

Everything else (carousel, resume list, `/work-experience/<slug>` page, RSS, sitemap) is generated automatically from the content collection via `getCollection("work-experience")`. There is **no registry file** to update for those — don't go looking for one.

## Step-by-step

### 1. Get the cover image — blocking, and not yours to generate

Every entry needs `public/<slug>-cover.webp` (WebP, portrait — existing covers are 1080×1920). **This has to come from the user.** It's the company's actual logo/branding, not a generic illustration, so it isn't something to generate or approximate — don't try to create a placeholder or offer to make one, and don't ask an image-generation tool to produce it either.

Ask the user for the image and **stop the whole process here** until they've placed the file at `public/<slug>-cover.webp`. Don't create the content entry, pick a shadow color, or touch anything else first — the next two steps both depend on having the actual image in hand (step 3 needs to read its colors). Once the user confirms the file is in place, verify it exists before continuing:

```bash
ls public/<slug>-cover.webp
```

### 2. Create the new entry

New file at `src/content/work-experience/<slug>.md`. The slug becomes the URL (`/work-experience/<slug>`) and the `id` used elsewhere. Schema is defined in `src/content.config.ts` — read it before writing frontmatter, in case it has changed since this skill was written.

```yaml
---
company: "Company Name"          # long name — used on the detail page, resume, RSS
cover:
  src: "/company-cover.webp"     # root-relative path into public/, from step 1
  alt: "Logotype of Company Name"
from: 2025-05-05                 # first day. Must be a real calendar date (e.g. no April 31st)
position: "Job Title"
shadow: "shadow-<color>-400/50 dark:shadow-<color>-300/60"   # see step 3 for picking a color
summary: "First-person, present tense while the job is current. Describe what you actually do, not a generic title description — ask the user for specifics rather than inventing them."
title: "Company Name"            # short name — used on the home carousel card
---

### Detalle
```

Leave `to` out entirely — that's what marks it as the current job and renders "Present". Do not set `subitems` unless the user explicitly describes multiple distinct roles within the same company (like the Buenos Aires City Government entry does). Once the file is created, run `git status` — a new file in `public/` from step 1 is untracked by default, and it's easy to commit the content entry while forgetting the image that entry points to. This exact mistake happened in the session this skill is based on.

### 3. Pick a shadow color that matches the cover

The `shadow` field is a literal Tailwind class string consumed only by `src/pages/work-experience/[id].astro`, injected into the cover figure's box-shadow. Every existing entry's color choice **echoes that company's actual cover image** (e.g. Mercado Libre's cover is yellow-branded, so its shadow is `shadow-yellow-400/50 dark:shadow-yellow-300/60`) — look at the cover image from step 1 and pick the closest matching Tailwind color, don't just grab whatever's unused. Check the existing entries for the pattern and to avoid an exact duplicate:

```bash
grep -h "shadow:" src/content/work-experience/*.md
```

It works with any Tailwind color because `src/styles/global.css` has `@source` scanning `.md` files — no safelist needed, but the class **must appear as a literal string** in the frontmatter (not composed dynamically) for Tailwind to detect it.

### 4. Close the previous current job

Find the entry that currently has no `to` field (that's the one rendering "Present" — usually whichever one the resume shows first). Add a `to:` date, and flip its `summary` from present tense to past tense ("I work at..." → "I worked at..."). Nothing else about that entry changes.

### 5. Update the profile-wide "current job" mentions

These are hardcoded and easy to miss because they live outside the content collection:

- **`src/config/site.json`** — `basics.label` (shown on `/resume`, has a `[years]` placeholder that gets substituted at build time, leave it as literal text `[years]`) and `basics.currentPosition`.
- **`src/sections/home/hero/Profile.astro`** — the home page has its own hardcoded "`<position>` at `<company>`" line with a link. Update both the text and the `href` to `/work-experience/<slug>`. When editing this file, keep the `{" "}` whitespace markers between inline elements — Astro's `compressHTML: 'jsx'` mode strips whitespace across line breaks otherwise, and text will visibly run together (e.g. "Engineer atMercado Libre"). Verify this visually after editing, don't just trust the diff.

While in `Profile.astro`, double check the link's `href` actually resolves to a real route (`/work-experience/<slug>`, not something like `/experience/<slug>`) — a stale href here caused a live 404 before this skill existed.

### 6. Ask before touching anything else

`basics.about` (site.json) and the home "About" card text describe the person's specialties, not their current job — don't change them automatically just because the job changed. Ask the user if they want to revisit that copy; don't assume.

## Verification

1. `pnpm build` — runs `astro check` (validates the Zod schema) then `astro build`. Must be 0 errors/warnings.
2. Confirm exactly one entry renders "Present": `grep -o Present dist/resume/index.html | wc -l` after the build should print `1`.
3. `pnpm preview`, then check visually (Chrome DevTools MCP is available in this environment) in both light and dark:
   - `/` — new entry appears in the carousel with its cover and correct dates; home hero text/link match step 5.
   - `/resume` — new entry first (sorted by `from`, newest first, automatic), closed entry shows a real end date instead of "Present".
   - `/work-experience/<slug>` — company, position, duration, summary, and the new `shadow` color render correctly on the cover figure.
4. `astro` isn't on `PATH` directly in this environment — use `pnpm exec astro preview status` / `pnpm exec astro preview stop` to manage the background preview server, and stop it when you're done verifying.

## Delivery

This repo uses trunk-based development — see `AGENTS.md` at the repo root for the branch/PR/CI conventions. Branch off `main`, commit, push, open a PR, wait for the `build` check, and **do not merge without the user's explicit go-ahead** even if they approved the plan — plan approval and merge approval are two separate confirmations.
