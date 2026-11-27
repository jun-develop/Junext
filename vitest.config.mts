import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    // 'server-only' throws outside a React Server build; tests run server modules directly.
    alias: { 'server-only': fileURLToPath(new URL('./tests/empty.ts', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.ts'],
    env: { JUNGO_API_URL: 'http://localhost:8080' },
  },
});
