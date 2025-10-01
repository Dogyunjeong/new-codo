import { Route } from "@base/server-base";
import { FeedHandler } from './feed.handler.mts';

// Note: This file is not used by index.mts; kept for reference.
// The FeedHandler now requires dependencies; this file would need DI wiring if used.
const feedHandler = {} as any;

export const feedRoutes: Route[] = [
  {
    method: 'GET',
    url: '/feed/home',
    handler: feedHandler.getHomeFeed,
  },
  {
    method: 'GET',
    url: '/feed/journey/:journeyId',
    handler: (feedHandler as any).getJourneyTimeline,
  },
  {
    method: 'POST',
    url: '/feed/refresh',
    handler: feedHandler.refreshFeed,
  },
];
