import type { Locale } from "./ui";

/**
 * The `/resume` ↔ `/cv` pairing in one place. Anything that needs "where does
 * this locale's CV live" or "how do the two pages link to each other" reads
 * this: `LanguageSwitch`, the `hreflang` alternates in `ResumeLayout`, and
 * `<html lang>`. Add a locale/route here and those all follow.
 */
export interface LocaleRoute {
  /** Site-absolute path, trailing slash to match the canonical URL. */
  href: string;
  /** BCP-47 tag — `<html lang>`, `hreflang` alternates, sitemap. */
  hreflang: string;
  /** Label for the link that points AT this locale (rendered on the others). */
  switchLabel: string;
}

export const localeRoutes = {
  en: { href: "/resume/", hreflang: "en", switchLabel: "English" },
  es: { href: "/cv/", hreflang: "es", switchLabel: "Español" },
} as const satisfies Record<Locale, LocaleRoute>;

/** Locale for the `x-default` hreflang and the site's canonical default. */
export const defaultLocale: Locale = "en";
