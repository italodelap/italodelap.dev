import { defineConfig } from 'astro/config';

import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  adapter: vercel({ webAnalytics: { enabled: true } }),
  site: "https://www.italodelap.dev",
  vite: { plugins: [tailwindcss()] },
});
