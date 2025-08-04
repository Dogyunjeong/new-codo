import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.mts'],
  format: ['esm'],
  target: 'node18',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  treeshake: true,
  dts: false,
  external: ['@base/shared-types'],
  noExternal: [],
  esbuildOptions(options) {
    options.mainFields = ['module', 'main'];
  },
});