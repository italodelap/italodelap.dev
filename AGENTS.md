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

## Git workflow

This project follows **trunk-based development**: no long-lived `develop` branch. Short-lived branches (`feat/x`, `fix/x`, `chore/x`, `ci/x`) branch off `main` and merge back via PR.

- **Branch protection on `main`**: a PR is required to merge (0 approvals required — solo maintainer), the `build` status check must pass and be up to date (`strict` required status checks), and force-pushes/branch deletion are disabled. `enforce_admins` is off, so the repo owner can bypass in an emergency.
- **CI** (`.github/workflows/ci.yml`): runs `pnpm build` (`astro check` + `astro build`) on every PR targeting `main`, enabling Corepack first — mirrors how Vercel resolves the pnpm version, to avoid repeating past version-mismatch deploy failures.
- **Deploys**: Vercel is linked via the GitHub integration, so every push to any branch/PR automatically gets its own preview deployment — no extra config needed to preview a branch. Note: Vercel Authentication (SSO) is enabled on production and all previews, so preview URLs require being logged into the Vercel team to view (or a bypass token); they're not publicly shareable as-is.
- `.github/workflows/claude.yml` (the `@claude`-mention-triggered workflow) is intentionally kept. The automatic per-PR Claude review workflow (`claude-code-review.yml`) was removed — it wasn't adding value and added unnecessary token spend.

## Development

Astro 7 automatically starts `astro dev` (and, since 7.2, `astro preview`) as a detached **background** process when it detects an AI coding agent — this prevents the server from blocking the agent's terminal. When that happens it writes a lock file (`.astro/dev.json` or `.astro/preview.json`) with the server's URL, port, and PID, and exposes a health endpoint at `/_astro/status` (`{"ok": true}`) so an agent can poll readiness. Manage a background server with:

```bash
astro dev status         # check if a server is running, and its URL/PID/uptime
astro dev logs [--follow]  # view logs from the background server
astro dev stop            # SIGTERM, escalating to SIGKILL after 5s
```

The same subcommands exist for `astro preview`. To opt out of background mode (e.g. for a normal foreground `pnpm dev`), set `ASTRO_DEV_BACKGROUND=0` / `ASTRO_PREVIEW_BACKGROUND=0` before running the command.

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

## Documentation

Full documentation: https://docs.astro.build. Astro also runs an MCP server with real-time access to current docs at `https://mcp.docs.astro.build/mcp` — prefer it over relying on training data for anything API-related.

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
