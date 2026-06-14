import type { RouteConfig } from '@base/server-base';
import { authRoutes } from '../api/auth/auth.routes.mts';

export const authServiceRoutes: RouteConfig[] = [
  { plugin: authRoutes, prefix: '/api/auth' },
];
