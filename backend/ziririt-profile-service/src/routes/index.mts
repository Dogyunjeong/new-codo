import type { RouteConfig } from '@base/server-base';
import { profileRoutes } from '../api/profile/profile.routes.mts';
import { journeyRoutes } from '../api/journey/journey.routes.mts';
import { socialRoutes } from '../api/social/social.routes.mts';

export const profileServiceRoutes: RouteConfig[] = [
  { plugin: profileRoutes, prefix: '/api/profiles' },
  { plugin: journeyRoutes, prefix: '/api/journeys' },
  { plugin: socialRoutes, prefix: '/api/social' },
];
