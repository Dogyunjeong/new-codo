import { Logger } from "@base/server-base";

class GeneratingDialogueService {
  private _logger: Logger;
  constructor({ logger }: { logger: Logger }) {
    this._logger = logger;
  }

  public get = async () => {
    return "hello";
  };
}

export default GeneratingDialogueService;
