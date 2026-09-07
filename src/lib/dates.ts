import { getEntry } from "astro:content";

import type { Locale } from "@/i18n/ui";

function getYearsDifference(initialDate: Date, finalDate: Date): number {
  const years = finalDate.getUTCFullYear() - initialDate.getUTCFullYear();
  const months = finalDate.getUTCMonth() - initialDate.getUTCMonth();
  const days = finalDate.getUTCDate() - initialDate.getUTCDate();

  const isPartialYear = months < 0 || (months === 0 && days < 0);
  if (isPartialYear) { return years - 1; }

  return years;
}

export async function getExperienceYearsAmount() {
  const myFirstJob = await getEntry("work-experience", "buenos-aires");
  if (!myFirstJob) { return -1; }

  const firstJobPositions = myFirstJob.data.subitems;
  if (!firstJobPositions) { return -1; }

  const INDEX_OF_FIRST_JOB_AS_DEVELOPER = 1;
  const myFirstJobAsDeveloper = firstJobPositions[INDEX_OF_FIRST_JOB_AS_DEVELOPER];

  return getYearsDifference(myFirstJobAsDeveloper.from, new Date());
}

export function getFormattedDate(date: Date, lang: Locale = "en") {
  const formatted = new Intl.DateTimeFormat(
    lang === "es" ? "es-AR" : "en-US",
    { month: "short", year: "numeric", timeZone: "UTC" },
  ).format(date);

  // es-AR yields a lowercase month abbreviation ("sept. 2021"); the
  // printed date must not start lowercase. Harmless for en-US output.
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function getMachineReadableDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

