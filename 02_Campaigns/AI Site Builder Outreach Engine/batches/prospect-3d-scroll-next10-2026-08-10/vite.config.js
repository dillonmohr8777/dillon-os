import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";

const input = { lab: resolve(import.meta.dirname, "index.html") };
for (const slug of readdirSync(resolve(import.meta.dirname, "sites"))) {
  input[slug.replace(/-/g, "_")] = resolve(import.meta.dirname, "sites", slug, "index.html");
}

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input,
      output: {
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js"
      }
    }
  },
  server: { host: "127.0.0.1" },
  preview: { host: "127.0.0.1", port: 4178, strictPort: true }
});
