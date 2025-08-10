import { HttpRequest, IRequest } from '@base/shared-utils';

class AuthController {
  private readonly _httpRequest: IRequest;
  private readonly _isCached: boolean;

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

  // Health Check
  public healthCheck = async (): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>('/health');
    return response.data;
  };

  // OAuth Domain - Google Authentication
  public googleAuth = async (authData: {
    idToken: string;
    deviceId?: string;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<unknown> => {
    const response = await this._httpRequest.post<unknown>('/google', authData);
    return response.data;
  };

  // OAuth Domain - Apple Authentication
  public appleAuth = async (authData: {
    idToken: string;
    deviceId?: string;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<unknown> => {
    const response = await this._httpRequest.post<unknown>('/apple', authData);
    return response.data;
  };

  // Authentication Domain - Refresh Token
  public refreshToken = async (refreshToken: string): Promise<unknown> => {
    const response = await this._httpRequest.post<unknown>('/refresh', { refreshToken });
    return response.data;
  };

  // Authentication Domain - Logout
  public logout = async (refreshToken: string): Promise<unknown> => {
    const response = await this._httpRequest.post<unknown>('/logout', { refreshToken });
    return response.data;
  };

  // Authentication Domain - Verify Token
  public verifyToken = async (): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>('/verify');
    return response.data;
  };

  // Authentication Domain - Get Current User
  public getCurrentUser = async (): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>('/me');
    return response.data;
  };
}

export default AuthController;
