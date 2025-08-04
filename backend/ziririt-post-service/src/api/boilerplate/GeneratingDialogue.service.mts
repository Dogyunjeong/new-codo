import { Logger } from "base-server";

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
