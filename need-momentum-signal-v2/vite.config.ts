import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false
    // No manualChunks override: the React.lazy boundary in LazyScene.tsx
    // already emits three/r3f as its own chunk, so first paint never waits
    // on the renderer. Vite 8 bundles with rolldown, where a manualChunks
    // object is rejected outright — forcing one here would fight the split
    // rather than help it.
  }
});
