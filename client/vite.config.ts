import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Temporary shim: some Vite builds call `crypto.hash(...)` (Bun-style).
// In Node.js, provide a compatible wrapper using `createHash` so dev server doesn't crash.
try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g: any = globalThis as any;
  if (!g.crypto) g.crypto = {};
  if (typeof g.crypto.hash !== 'function') {
    // Dynamically import to avoid bundling issues in the browser
    const { createHash } = await import('node:crypto');
    g.crypto.hash = (algo: string, data: string | Uint8Array, enc: BufferEncoding = 'hex') => {
      return createHash(algo).update(data as any).digest(enc);
    };
  }
} catch {
  // Best-effort only; if it fails, Vite may still work in environments that provide crypto.hash
}

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
