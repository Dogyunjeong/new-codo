import type { RouteConfig } from '@base/server-base';
import { feedRoutes } from '../api/feed/feed.routes.mts';

export const feedServiceRoutes: RouteConfig[] = [
  { plugin: feedRoutes, prefix: '/api/feed' },
];
