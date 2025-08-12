import { Route } from "@base/server-base";
import FeedHandler from './feed.handler.mjs';

const feedHandler = new FeedHandler();

export const feedRoutes: Route[] = [
  {
    method: 'GET',
    url: '/feed/home',
    handler: feedHandler.getHomeFeed,
  },
  {
    method: 'GET',
    url: '/feed/goal/:goalId',
    handler: feedHandler.getGoalTimeline,
  },
  {
    method: 'POST',
    url: '/feed/refresh',
    handler: feedHandler.refreshFeed,
  },
];