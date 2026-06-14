import { HttpRequest, IRequest } from '@base/shared-utils';

class FeedController {
  private _httpRequest: IRequest;
  private _isCached: boolean;

  constructor({
    baseURL,
    httpRequest,
    isCached,
  }: { baseURL?: string; httpRequest?: IRequest; isCached?: boolean } = {}) {
    const url = isCached ? `${baseURL}/cached-api` : `${baseURL}`;
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

  public getHttpRequest = (): IRequest => {
    return this._httpRequest;
  };

  // Health Check
  public healthCheck = async (): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>('/health');
    return response.data;
  };

  // Feed Domain
  public getHomeFeed = async (page: number = 1, limit: number = 20): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>(`/api/feed/home?page=${page}&limit=${limit}`);
    return response.data;
  };

  public getJourneyTimeline = async (journeyId: string, page: number = 1, limit: number = 20): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>(`/api/feed/journey/${journeyId}?page=${page}&limit=${limit}`);
    return response.data;
  };

  public getUserFeed = async (userId: string, page: number = 1, limit: number = 20): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>(`/api/feed/user/${userId}?page=${page}&limit=${limit}`);
    return response.data;
  };

  public getHashtagFeed = async (hashtag: string, page: number = 1, limit: number = 20): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>(`/api/feed/hashtag/${hashtag}?page=${page}&limit=${limit}`);
    return response.data;
  };

  public refreshFeed = async (): Promise<unknown> => {
    const response = await this._httpRequest.post<unknown>('/api/feed/refresh', {});
    return response.data;
  };
}

export default FeedController;
