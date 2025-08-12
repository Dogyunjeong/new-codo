import { handleError, handleResponse } from "@base/server-base";
import { FastifyRequest, RouteHandler } from 'base-server/fastifyServer';
import FeedService from './feed.service.mjs';

class FeedHandler {
  private _getDependencies = (req: FastifyRequest) => {
    const { logger } = req;
    const feedService = new FeedService({
      logger,
    });
    return {
      feedService,
    };
  };

  public getHomeFeed: RouteHandler<{}> = async (req, rep) => {
    try {
      const { feedService } = this._getDependencies(req);
      const page = parseInt((req.query as any)?.page || '1', 10);
      const result = await feedService.getHomeFeed(page);
      handleResponse({ req, rep, data: result });
      return rep.send(result);
    } catch (error) {
      handleError({
        req,
        rep,
        error,
        defaultMessage: req.i18n.t(
          'feed:failed_to_get_home_feed',
          'Failed to get home feed',
        ),
      });
    }
  };

  public getGoalTimeline: RouteHandler<{}> = async (req, rep) => {
    try {
      const { feedService } = this._getDependencies(req);
      const { goalId } = req.params as { goalId: string };
      const page = parseInt((req.query as any)?.page || '1', 10);
      const result = await feedService.getGoalTimeline(goalId, page);
      handleResponse({ req, rep, data: result });
      return rep.send(result);
    } catch (error) {
      handleError({
        req,
        rep,
        error,
        defaultMessage: req.i18n.t(
          'feed:failed_to_get_goal_timeline',
          'Failed to get goal timeline',
        ),
      });
    }
  };

  public refreshFeed: RouteHandler<{}> = async (req, rep) => {
    try {
      const { feedService } = this._getDependencies(req);
      const result = await feedService.refreshFeed();
      handleResponse({ req, rep, data: result });
      return rep.send({ message: 'Feed refreshed successfully' });
    } catch (error) {
      handleError({
        req,
        rep,
        error,
        defaultMessage: req.i18n.t(
          'feed:failed_to_refresh_feed',
          'Failed to refresh feed',
        ),
      });
    }
  };
}

export default FeedHandler;