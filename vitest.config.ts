import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/renderer/src/**/*.{ts,tsx}', 'src/shared/**/*.ts'],
      exclude: [
        'src/renderer/src/main.tsx',
        'src/renderer/src/styles/**',
        '**/*.test.{ts,tsx}',
        'src/shared/types/**',
        'src/shared/plugin-interface.ts',
      ],
      thresholds: {
        lines: 80,
        branches: 80,
      },
      reporter: ['text', 'html'],
    },
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
    },
  },
})
