import { defineConfig } from "windicss/helpers";

export default defineConfig({
  extract: {
    include: ["src/**/*.{astro,tsx,ts}"],
    exclude: ["node_modules", ".git"],
  },
});
