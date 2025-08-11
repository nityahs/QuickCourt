import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Note: Avoid overriding Node globals like 'global' to prevent breaking Vite's internals.
  // If a library needs 'global', prefer using globalThis in code or a targeted shim instead of define.global
  server: {
    host: true, // 0.0.0.0
    port: 5173,
    strictPort: true,
  },
});
