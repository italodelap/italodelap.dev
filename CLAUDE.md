# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at localhost:4321
npm run build     # Type-check (astro check) then build to ./dist/
npm run preview   # Preview production build locally
```

There are no lint or test scripts configured.

## Architecture

**Stack:** Astro 5 (SSG) + TypeScript + Tailwind CSS v4

**Key path alias:** `@/*` → `src/*`

### Page routing (file-based)

- `/` → `src/pages/index.astro`
- `/resume` → `src/pages/resume.astro`
- `/work-experience/[id]` → `src/pages/work-experience/[id].astro` (dynamic, uses `getStaticPaths()`)

### Directory structure

- `src/sections/` — Page-level compositions (e.g. `home/Hero.astro`, `resume/Experience.astro`)
- `src/components/` — Reusable UI primitives
- `src/lib/` — Client-side utilities (carousel, keyboard shortcuts, dates, counters)
- `src/content/work-experience/` — Markdown files for job entries (Astro Content Collections)
- `src/config/site.json` — Central config for site metadata, contact channels, education
- `src/content.config.ts` — Zod schema for `work-experience` collection

### Theme system

`ThemeManager.astro` runs an inline client script that reads/writes `localStorage` and sets a `[data-theme]` attribute on `<html>`. The global `window.theme` object (typed in `env.d.ts`) is the public API for theme toggling.

### Keyboard shortcuts

`src/lib/keyboard-shortcut-interface.ts` registers commands with the `hotkeypad` library (Cmd/Ctrl+K). Commands are built dynamically from `contact-channels.ts`. Only rendered on desktop (excluded from mobile via `KeyboardShortcutInterface.astro`).

### Content collections

Work experience entries live in `src/content/work-experience/*.md`. The schema (company, position, cover image, dates, summary, title, shadow, optional subitems) is validated by Zod in `src/content.config.ts`. Add new job entries by creating a new `.md` file there.
