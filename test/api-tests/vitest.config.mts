import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 30000,
    hookTimeout: 10000,
    setupFiles: ['./setup.mts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.git'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'test/**',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  },
  resolve: {
    alias: {
      '@base/shared-controllers': '/Users/dogyun/projects/ziririt-1/packages/shared-controllers/src',
      '@base/shared-services': '/Users/dogyun/projects/ziririt-1/packages/shared-services/src',
      '@base/shared-types': '/Users/dogyun/projects/ziririt-1/packages/shared-types/src'
    }
  }
});