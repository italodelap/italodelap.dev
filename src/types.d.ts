export interface WorkExperience extends Array<ExperienceEntry> {}

export interface ExperienceEntry {
  cover: string;
  company: string;
  from: string;
  position: string;
  title: string;
  to?: string;
  url: string;
}
