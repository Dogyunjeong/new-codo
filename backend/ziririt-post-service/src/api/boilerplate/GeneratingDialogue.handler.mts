import { handleError, handleResponse } from 'base-server';
import { FastifyRequest, RouteHandler } from 'base-server/fastifyServer';
import GeneratingDialogueService from './GeneratingDialogue.service.mjs';

class GeneratingDialogueHandler {
  private _getDependencies = (req: FastifyRequest) => {
    const { logger } = req;
    const learningDialogueService = new GeneratingDialogueService({
      logger,
    });
    return {
      learningDialogueService,
    };
  };

  public get: RouteHandler<{}> = async (req, rep) => {
    try {
      const { learningDialogueService } = this._getDependencies(req);
      const result = await learningDialogueService.get();
      handleResponse({ req, rep, data: result });
      return rep.send({ message: 'Hello World' });
    } catch (error) {
      handleError({
        req,
        rep,
        error,
        defaultMessage: req.i18n.t(
          'learningDialogue:failed_to_get_learningDialogue',
          'Failed to get learningDialogue',
        ),
      });
    }
  };
}

export default GeneratingDialogueHandler;
