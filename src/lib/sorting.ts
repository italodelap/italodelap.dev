import type { CollectionEntry } from "astro:content";

type JobsArray = CollectionEntry<"work-experience">[];
type PositionsArray = NonNullable<CollectionEntry<"work-experience">["data"]["subitems"]>;

type SortableExperience = JobsArray | PositionsArray;

function getSortedJobs(jobs: JobsArray) {
  return jobs.toSorted((a, b) => {
    if (a.data.from < b.data.from) return 1;
    if (a.data.from > b.data.from) return -1;
    return 0;
  });
}

function getSortedPositions(positions: PositionsArray) {
  return positions.toSorted((a, b) => {
    if (a.from < b.from) return 1;
    if (a.from > b.from) return -1;
    return 0;
  });
}

function isExperienceACollectionEntryArray(experience: any): experience is JobsArray {
  return Array.isArray(experience) && experience.every(item => item.data && item.data.from);
}

// Function overloads
export function getSortedExperience(experience: JobsArray): JobsArray;
export function getSortedExperience(experience: PositionsArray): PositionsArray;

// Function implementation
export function getSortedExperience(experience: SortableExperience): SortableExperience {
  if (!experience) return [];

  return isExperienceACollectionEntryArray(experience) ? getSortedJobs(experience) : getSortedPositions(experience);
}
