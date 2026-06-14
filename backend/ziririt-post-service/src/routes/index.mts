import type { RouteConfig } from '@base/server-base';
import { postRoutes } from '../api/post/post.routes.mts';
import { mediaRoutes } from '../api/media/media.routes.mts';
import { interactionRoutes } from '../api/interaction/interaction.routes.mts';
import { interactionV01Routes } from '../api/interaction/interaction.v01.routes.mts';

export const postServiceRoutes: RouteConfig[] = [
  { plugin: postRoutes, prefix: '/api/posts' },
  { plugin: mediaRoutes, prefix: '/api/media' },
  { plugin: interactionRoutes, prefix: '/api/interactions' },
  { plugin: interactionV01Routes, prefix: '/api/posts' },
];
