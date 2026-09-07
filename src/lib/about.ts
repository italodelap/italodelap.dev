import { basics } from "@/config/site.json";
import { getExperienceYearsAmount } from "@/lib/dates";

/** Replace the literal `[years]` token in an "about" blurb template. */
export function fillAboutTemplate(template: string, years: number): string {
  return template.replace("[years]", years.toString());
}

/**
 * English "about" copy with `[years]` resolved. Used as the site-wide default
 * meta description (`Layout.astro`) and on `/profile`. The `/resume` and `/cv`
 * copy is resolved per-locale by `getResumeContent` instead.
 */
export async function getFormattedAbout(): Promise<string> {
  return fillAboutTemplate(basics.about, await getExperienceYearsAmount());
}
