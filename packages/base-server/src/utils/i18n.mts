import { ExpectedServerError } from '@base/shared-utils';

let t = (key: string, defaultValue: string) => {
  return defaultValue;
};

class I18n {
  private static _instance: I18n;
  public static init = () => {
    I18n._instance = new I18n();
    t = I18n._instance.t;
  };

  public static getInstance = () => {
    if (!I18n._instance) {
      throw new ExpectedServerError('I18n has not been initialized');
    }
    return I18n._instance;
  };

  constructor() {}

  public t = (key: string, defaultValue: string) => {
    return defaultValue;
  };
}

export { t };
export default I18n;
