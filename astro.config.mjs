import { defineConfig } from "astro/config";
import solidJs from "@astrojs/solid-js";
import Windicss from "vite-plugin-windicss";

// https://astro.build/config
export default defineConfig({
  integrations: [solidJs()],
  vite: {
    plugins: [Windicss()],
  },
});
