// src/i18n/index.ts
import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

import { basics, education } from "@/config/site.json";
import { getSortedExperience } from "@/lib/sorting";

import { cvEs } from "./cv.es";
import type { ExperienceOverride } from "./cv.es";
import type { Locale } from "./ui";

type WorkExperienceEntry = CollectionEntry<"work-experience">;
type Subitem = NonNullable<WorkExperienceEntry["data"]["subitems"]>[number];

export interface ResumeExperienceSubitem {
  position: string;
  from: Date;
  to?: Date;
  highlights: string[];
}

export interface ResumeExperienceEntry {
  company: string;
  position: string;
  from: Date;
  to?: Date;
  highlights: string[];
  subitems: ResumeExperienceSubitem[];
}

export interface ResumeEducationEntry {
  area: string;
  institution: string;
  from: string;
  to: string;
  notes: string;
}

export interface ResumeLanguage {
  language: string;
  level: string;
}

export interface ResumeContent {
  label: string;
  location: { city: string; country: string };
  languages: ResumeLanguage[];
  education: ResumeEducationEntry[];
  experience: ResumeExperienceEntry[];
}

function hasHighlights(entry: { highlights?: string[] }): boolean {
  return Boolean(entry.highlights && entry.highlights.length > 0);
}

/** Build the same sorted/filtered/curated job list the resume showed before i18n. */
function curate(jobs: WorkExperienceEntry[]) {
  return getSortedExperience(jobs)
    .map((job) => {
      const curatedSubitems: Subitem[] = job.data.subitems
        ? getSortedExperience(job.data.subitems).filter(hasHighlights)
        : [];
      return { job, curatedSubitems };
    })
    .filter(
      ({ job, curatedSubitems }) =>
        hasHighlights(job.data) || curatedSubitems.length > 0,
    );
}

function toEnglishEntry(
  job: WorkExperienceEntry,
  curatedSubitems: Subitem[],
): ResumeExperienceEntry {
  return {
    company: job.data.company,
    position: job.data.position,
    from: job.data.from,
    to: job.data.to,
    highlights: job.data.highlights ?? [],
    subitems: curatedSubitems.map((s) => ({
      position: s.position,
      from: s.from,
      to: s.to,
      highlights: s.highlights ?? [],
    })),
  };
}

function applySpanish(
  entry: ResumeExperienceEntry,
  id: string,
): ResumeExperienceEntry {
  const table = cvEs.experience as Record<string, ExperienceOverride | undefined>;
  const override = table[id];

  if (!override) {
    throw new Error(`Missing ES translation for work-experience entry "${id}"`);
  }

  const subOverrides = override.subitems ?? {};

  return {
    ...entry,
    company: override.company,
    highlights: override.highlights ?? entry.highlights,
    subitems: entry.subitems.map((s) => {
      const sh = subOverrides[s.position];
      if (!sh) {
        throw new Error(
          `Missing ES translation for subitem "${s.position}" of "${id}"`,
        );
      }
      return { ...s, highlights: sh };
    }),
  };
}

export async function getResumeContent(lang: Locale): Promise<ResumeContent> {
  const curated = curate(await getCollection("work-experience"));

  const experience: ResumeExperienceEntry[] = curated.map(
    ({ job, curatedSubitems }) => {
      const en = toEnglishEntry(job, curatedSubitems);
      return lang === "es" ? applySpanish(en, job.id) : en;
    },
  );

  if (lang === "es") {
    return {
      label: cvEs.label,
      location: cvEs.location,
      languages: cvEs.languages.map((l) => ({ ...l })),
      education: cvEs.education.map((es, i) => ({
        area: es.area,
        institution: es.institution,
        notes: es.notes,
        from: education[i].from,
        to: education[i].to,
      })),
      experience,
    };
  }

  return {
    label: basics.label,
    location: { city: basics.location.city, country: basics.location.country },
    languages: basics.languages.map((l) => ({ ...l })),
    education: education.map((e) => ({
      area: e.area,
      institution: e.institution,
      notes: e.notes,
      from: e.from,
      to: e.to,
    })),
    experience,
  };
}
