import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const demoDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/vn-tts/" : "/",
  resolve: {
    alias: {
      "@thomasjvu/vn-tts": path.resolve(demoDir, "../dist/index.js"),
    },
  },
  build: {
    outDir: "dist",
  },
});