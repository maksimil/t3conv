import { defineConfig } from "windicss/helpers";

export default defineConfig({
  extract: {
    include: ["src/**/*.{astro,tsx}"],
    exclude: ["node_modules", ".git"],
  },
});
