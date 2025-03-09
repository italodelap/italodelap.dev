import { getCollection } from "astro:content";
import rss from "@astrojs/rss";

import { basics, siteName } from "@/config/site.json";

export async function GET(context) {
  const jobs = await getCollection("work-experience");

  return rss({
    title: siteName,
    site: context.site,
    description: basics.about,
    items: jobs.map((job) => ({
      description: job.data.summary,
      link: `/work-experience/${job.id}`,
      title: `Work experience at ${job.data.company}`,
    })),
  });
}
