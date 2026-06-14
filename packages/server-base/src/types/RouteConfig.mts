import type { FastifyPluginCallback } from 'fastify';

export interface RouteConfig {
  plugin: FastifyPluginCallback;
  prefix: string;
}
