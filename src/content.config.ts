import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const workExperience = defineCollection({
  loader: glob({ pattern: "**/*.(md|mdx)", base: "./src/content/work-experience" }),
  schema: z.object({
    company: z.string(),
    cover: z.object({
      src: z.string(),
      alt: z.string(),
    }),
    from: z.coerce.date(),
    position: z.string(),
    shadow: z.string(),
    summary: z.string(),
    title: z.string(),
    to: z.coerce.date().optional(),
    subitems: z.array(z.object({
      from: z.coerce.date(),
      position: z.string(),
      summary: z.string(),
      to: z.coerce.date().optional(),
    })).optional(),
  }),
});

export const collections = { "work-experience": workExperience };
