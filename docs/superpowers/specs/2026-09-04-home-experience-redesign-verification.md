# Home experience redesign — verification results

Measured results for the verification section of
`2026-09-04-home-experience-redesign-design.md`. The spec explicitly refused
to assume the panel's contrast passed; these are the numbers that settled it.

Measured on the rendered page at 1280×900 unless noted, in both themes, over
all five covers. Text was made transparent before sampling so the screenshot
contained only the composited background.

## Contrast

| What | Bar | Light | Dark |
| --- | --- | --- | --- |
| Panel body copy (worst of five covers) | 4.5:1 | **13.43:1** | **10.82:1** |
| Chevron, resting cover (worst of five) | 3:1 | pass | **4.53:1** |
| Focus ring against its surroundings | 3:1 | **3.92:1** | **3.59:1** |

The panel passed on first measurement, so the spec's fix ladder — lower the
cover opacity, then raise the panel's background alpha — was never entered.
`--cover-opacity-open` stayed at `0.22` / `0.16` and the panel stayed at
`zinc-50/85` / `zinc-900/85`.

Two failures were found and fixed rather than measured-and-accepted:

- The chevron read **1.88:1** in dark on four of the five covers. Fixed by
  moving it from `dark:text-neutral-400` to `dark:text-neutral-50`.
- There was **no visible focus indicator at all**. `Box`'s decorative
  `outline-1`, copied onto the disclosure button, had replaced the browser's
  focus ring: a focused button and a resting button computed byte-identical
  styles in both themes (WCAG 2.4.7). Fixed with an explicit `focus-visible`
  ring, its colour chosen by measurement.

Independently re-measured during review at 390×844 using the pixels actually
under the glyph rather than a per-slide mean, on the darkest cover: chevron
worst pixel 3.68:1, ring band 3.81:1, light theme 3.74:1. All clear.

## Behaviour

- **Touch gate** — verified in a real `hasTouch`/`isMobile` context at
  390×844: `(hover: hover) and (pointer: fine)` evaluates false, panels start
  hidden, tap opens and tap closes (read from `data-open`, not inferred from
  the click), and a swipe begun on the button itself advances the carousel
  without leaving anything open.
- **Keyboard** — one disclosure button per slide in carousel order, nothing
  else focusable inside a slide, `Enter` and `Space` both toggle, and
  `aria-expanded` follows. The panel is `visibility: hidden` while closed and
  is genuinely absent from the accessibility tree, then exposed with its full
  text when opened.
- **Reduced motion** — transitions collapse to a fade, no translate, no cover
  scale. The rule block is theme-independent; verified in light.

## Panel fit

`scrollHeight` / `clientHeight` for the longest summary (Mercado Libre, 545
characters):

| Viewport | Slide width | Panel | Result |
| --- | --- | --- | --- |
| 1280px | 350px | 262 / 262 | fits, no scroll |
| 390px | 218px | 399 / 264 | scrolls 135px |

Known limitation, accepted rather than fixed: the panel also scrolls at 360,
550, 640, 768, 900 and 1024px. The worst case is 768px, where the 750px
breakpoint's three-up layout leaves a ~184px column for text needing ~477px.
This is within spec — a scroll-free fit is required only at ≥1200px, with
`overflow-y: auto` named as the safety net everywhere else — but fixing it
properly means revisiting the carousel's intermediate breakpoints, which is
its own piece of work.

A small-viewport `--slide-height` bump (30rem → 39rem) was tried during
implementation to avoid that scrolling on phones, then reverted. It was
over-provisioned across most of the range it covered, it grew resting cards
as well as open ones, and it created a 144px height cliff at the 550px
boundary. The reasoning that motivated it was also wrong: Embla sets
`touch-action: pan-y pinch-zoom` and so does not capture vertical gestures,
meaning a scrollable panel does not fight the carousel's swipe.
