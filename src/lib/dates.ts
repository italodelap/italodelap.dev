import { getEntry } from "astro:content";

function getYearsDifference(initialDate: Date, finalDate: Date): number {
  const years = finalDate.getFullYear() - initialDate.getFullYear();
  const months = finalDate.getMonth() - initialDate.getMonth();
  const days = finalDate.getDate() - initialDate.getDate();

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

export function getFormattedDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}

