import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/vn-tts/" : "/",
  build: {
    outDir: "dist",
  },
});