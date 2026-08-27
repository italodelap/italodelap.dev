import { getCollection } from "astro:content";
import rss from "@astrojs/rss";

import { siteName } from "@/config/site.json";

import { getFormattedAbout } from "@/lib/dates";

export async function GET(context) {
  const jobs = await getCollection("work-experience");

  return rss({
    title: siteName,
    site: context.site,
    description: await getFormattedAbout(),
    items: jobs.map((job) => ({
      description: job.data.summary,
      link: `/work-experience/${job.id}`,
      title: `Work experience at ${job.data.company}`,
    })),
  });
}
