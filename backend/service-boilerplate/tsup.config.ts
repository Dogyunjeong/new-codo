import { defineConfig } from 'tsup';

export default defineConfig(() => {
  return {
    entry: ['src/index.mts'],
    target: 'node22',
    format: ['esm'],
    noExternal: [/@base\/.+$/, 'base-server'],
    splitting: false,
    sourcemap: true,
    platform: 'node',
    clean: true,
  };
});
