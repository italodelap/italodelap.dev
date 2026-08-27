import { getEntry } from "astro:content";

import { basics } from "@/config/site.json";

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

export async function getFormattedAbout() {
  const yearsOfExperience = await getExperienceYearsAmount();
  return basics.about.replace("[years]", yearsOfExperience.toString());
}

export function getFormattedDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function getMachineReadableDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

