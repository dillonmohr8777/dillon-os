import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        lab: resolve(import.meta.dirname, "index.html"),
        maclaren: resolve(import.meta.dirname, "sites/maclaren-kitchen-bath/index.html"),
        goldenEagle: resolve(import.meta.dirname, "sites/golden-eagle-jewelry/index.html"),
        morton: resolve(import.meta.dirname, "sites/morton-electric-pool-spa/index.html")
      },
      output: {
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js"
      }
    }
  },
  server: {
    host: "127.0.0.1"
  },
  preview: {
    host: "127.0.0.1",
    port: 4177,
    strictPort: true
  }
});
