import { defineConfig } from 'astro/config';

import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [sitemap()],
  site: "https://www.italodelap.dev",
  vite: { plugins: [tailwindcss()] },
});
