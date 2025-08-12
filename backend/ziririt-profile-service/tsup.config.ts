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
  external: ['fastify', '@fastify/cors', 'bcryptjs', 'google-auth-library', 'jsonwebtoken', 'pg', 'pino', 'pino-pretty', 'uuid', 'mongodb'],
  noExternal: ['@base/shared-types', '@base/server-services', '@base/shared-api-controllers', '@base/shared-utils'],
  esbuildOptions(options) {
    options.mainFields = ['module', 'main'];
  },
});