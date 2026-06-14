import { defineConfig } from 'tsup';

export default defineConfig(() => {
  return {
    entry: ['src/index.mts'],
    target: 'node22',
    format: ['esm'],
    noExternal: [
      /@base\/.+$/,
      'ziririt-auth-service',
      'ziririt-profile-service',
      'ziririt-post-service',
      'ziririt-feed-service',
    ],
    splitting: false,
    sourcemap: true,
    platform: 'node',
    clean: true,
  };
});
