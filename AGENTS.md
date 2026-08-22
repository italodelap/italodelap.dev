# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, etc.) when working with code in this repository.

## Commands

```bash
pnpm dev       # Start dev server at localhost:4321
pnpm build     # Type-check (astro check) then build to ./dist/
pnpm preview   # Preview production build locally
```

Package manager: pnpm (see `pnpm-lock.yaml`).

There are no lint or test scripts configured.

## Architecture

**Stack:** Astro 7 (SSG) + TypeScript + Tailwind CSS v4

**Key path alias:** `@/*` → `src/*`

### Page routing (file-based)

- `/` → `src/pages/index.astro`
- `/resume` → `src/pages/resume.astro`
- `/work-experience/[id]` → `src/pages/work-experience/[id].astro` (dynamic, uses `getStaticPaths()`)
- `/rss.xml` → `src/pages/rss.xml.js`
- `/robots.txt` → `src/pages/robots.txt.ts`

### Directory structure

- `src/sections/` — Page-level compositions (e.g. `home/Hero.astro`, `resume/Experience.astro`)
- `src/components/` — Reusable UI primitives
- `src/lib/` — Client-side utilities (carousel, keyboard shortcuts, dates, counters)
- `src/content/work-experience/` — Markdown files for job entries (Astro Content Collections)
- `src/config/site.json` — Central config for site metadata, contact channels, education
- `src/content.config.ts` — Zod schema for `work-experience` collection
- `src/icons/` — Icon components (`.astro`) used inline in markup, distinct from `src/assets/icons/` (raw `.svg` files referenced as assets)

### Theme system

`ThemeManager.astro` runs an inline client script that reads/writes `localStorage` and sets a `[data-theme]` attribute on `<html>`. The global `window.theme` object (typed in `env.d.ts`) is the public API for theme toggling.

### Keyboard shortcuts

`src/lib/keyboard-shortcut-interface.ts` registers commands with the `hotkeypad` library (Cmd/Ctrl+K). Commands are built dynamically from `contact-channels.ts`. Only rendered on desktop (excluded from mobile via `KeyboardShortcutInterface.astro`).

### Content collections

Work experience entries live in `src/content/work-experience/*.md`. The schema (company, position, cover image, dates, summary, title, shadow, optional subitems) is validated by Zod in `src/content.config.ts`. Add new job entries by creating a new `.md` file there.

### Whitespace between inline elements

`compressHTML` uses Astro 7's default (`'jsx'`), so whitespace is handled like JSX/React: a space between two inline elements is preserved only when it's on the same line as both, or is written explicitly. When a line break sits between text and an inline element (e.g. `text\n<a>link</a>`), the whitespace is stripped entirely rather than collapsed to a space — add `{" "}` on the line that needs the space (see `ExperienceDuration.astro`, `hero/About.astro`, `hero/Profile.astro`, `home/Footer.astro` for examples). Always verify visually after editing markup with adjacent inline elements.

### Markdown processor

Markdown/MDX files render with Astro's built-in Sätteri processor (the default since v7), not remark/rehype. `@astrojs/markdown-remark` isn't installed. Work experience `.md` bodies aren't currently rendered anywhere (see the commented-out `<Content />` in `work-experience/[id].astro`), so this only matters if that's revisited.
