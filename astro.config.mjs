import { defineConfig } from "astro/config";
import windicss from "astro-windicss";
import solidJs from "@astrojs/solid-js";

import prefetch from "@astrojs/prefetch";

// https://astro.build/config
export default defineConfig({
  integrations: [windicss(), solidJs(), prefetch()],
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            plotly: ["plotly.js-dist"],
          },
        },
      },
    },
  },
});

