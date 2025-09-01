import { HttpRequest, IRequest } from '@base/shared-utils';

class AuthController {
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

  // Health Check
  public healthCheck = async (): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>('/api/auth/health');
    return response.data;
  };

  // Email/Password Authentication
  public emailLogin = async (credentials: {
    email: string;
    password: string;
    deviceId?: string;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<unknown> => {
    const response = await this._httpRequest.post<unknown>('/api/auth/login', credentials);
    return response.data;
  };

  // v0.1-compatible alias
  public login = async (credentials: {
    email: string;
    password: string;
    deviceId?: string;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<unknown> => {
    return this.emailLogin(credentials);
  };

  // Email/Password Signup
  public emailSignup = async (signupData: {
    email: string;
    password: string;
    name: string;
    username?: string;
    deviceId?: string;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<unknown> => {
    const response = await this._httpRequest.post<unknown>('/api/auth/signup', signupData);
    return response.data;
  };

  // v0.1-compatible alias
  public signup = async (signupData: {
    email: string;
    password: string;
    name: string;
    username?: string;
    deviceId?: string;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<unknown> => {
    return this.emailSignup(signupData);
  };

  // OAuth Domain - Google Authentication
  public googleAuth = async (authData: {
    idToken: string;
    deviceId?: string;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<unknown> => {
    const response = await this._httpRequest.post<unknown>('/api/auth/google', authData);
    return response.data;
  };

  // OAuth Domain - Apple Authentication
  public appleAuth = async (authData: {
    idToken: string;
    deviceId?: string;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<unknown> => {
    const response = await this._httpRequest.post<unknown>('/api/auth/apple', authData);
    return response.data;
  };

  // Authentication Domain - Refresh Token
  public refreshToken = async (refreshToken: string): Promise<unknown> => {
    const response = await this._httpRequest.post<unknown>('/api/auth/refresh', { refreshToken });
    return response.data;
  };

  // Alias for refreshToken to maintain compatibility
  public refreshSession = async (data: { refreshToken: string; deviceId?: string }): Promise<any> => {
    const response = await this._httpRequest.post<unknown>('/api/auth/refresh', data);
    return response;
  };

  // Authentication Domain - Logout
  public logout = async (refreshToken: string): Promise<unknown> => {
    const response = await this._httpRequest.post<unknown>('/api/auth/logout', { refreshToken });
    return response.data;
  };

  // Authentication Domain - Verify Token
  public verifyToken = async (): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>('/api/auth/verify');
    return response.data;
  };

  // Authentication Domain - Get Current User
  public getCurrentUser = async (): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>('/api/auth/me');
    return response.data;
  };
}

export default AuthController;
