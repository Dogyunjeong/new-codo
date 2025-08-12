import { HttpRequest, IRequest } from '@base/shared-utils';

class BoilerPlateController {
  private _httpRequest: IRequest;
  private _isCached: boolean;

  constructor({
    baseURL,
    httpRequest,
    isCached,
  }: { baseURL?: string; httpRequest?: IRequest; isCached?: boolean } = {}) {
    const url = isCached ? `${baseURL}/cached-api` : `${baseURL}/api`;
    httpRequest?.setBaseUrl(url);
    this._httpRequest = httpRequest || new HttpRequest({ baseURL: url });
    this._isCached = isCached || false;
  }

  public setBaseUrl = (baseUrl: string): void => {
    this._httpRequest.setBaseUrl(baseUrl);
  };

  public setAccessToken = (accessToken: string): void => {
    this._httpRequest.setAccessToken(accessToken);
  };

  // Add your methods here
  public getResource = async (resourceId: string): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>(`/learning-paths/${resourceId}`);
    return response.data;
  };
}

export default BoilerPlateController;
