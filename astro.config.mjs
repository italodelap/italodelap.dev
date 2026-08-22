import { defineConfig } from 'astro/config';

import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // TODO(fase 4): quitar y adoptar el default 'jsx' de Astro 7
  compressHTML: true,
  integrations: [sitemap()],
  site: "https://www.italodelap.dev",
  vite: { plugins: [tailwindcss()] },
});
