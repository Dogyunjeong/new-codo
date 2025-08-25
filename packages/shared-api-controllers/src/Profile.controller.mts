import { HttpRequest, IRequest } from '@base/shared-utils';

class ProfileController {
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
    const response = await this._httpRequest.get<unknown>('/health');
    return response.data;
  };

  // Profile Domain
  public getUserProfile = async (userId: string): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>(`/api/profiles/${userId}`);
    return response.data;
  };

  public updateProfile = async (userId: string, profileData: any): Promise<unknown> => {
    const response = await this._httpRequest.put<unknown>(`/api/profiles/${userId}`, profileData);
    return response.data;
  };

  public deleteProfile = async (userId: string): Promise<unknown> => {
    const response = await this._httpRequest.delete<unknown>(`/api/profiles/${userId}`);
    return response.data;
  };

  // Goal Domain
  public getUserGoals = async (userId: string): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>(`/api/goals/user/${userId}`);
    return response.data;
  };

  public getGoal = async (goalId: string): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>(`/api/goals/${goalId}`);
    return response.data;
  };

  public createGoal = async (goalData: any): Promise<unknown> => {
    const response = await this._httpRequest.post<unknown>('/api/goals', goalData);
    return response.data;
  };

  public updateGoal = async (goalId: string, goalData: any): Promise<unknown> => {
    const response = await this._httpRequest.put<unknown>(`/api/goals/${goalId}`, goalData);
    return response.data;
  };

  public deleteGoal = async (goalId: string): Promise<unknown> => {
    const response = await this._httpRequest.delete<unknown>(`/api/goals/${goalId}`);
    return response.data;
  };

  // Social Domain
  public getFollowers = async (userId: string): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>(`/api/social/followers/${userId}`);
    return response.data;
  };

  public getFollowing = async (userId: string): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>(`/api/social/following/${userId}`);
    return response.data;
  };

  public getRelationship = async (userId: string): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>(`/api/social/relationship/${userId}`);
    return response.data;
  };

  public followUser = async (userId: string, targetUserId: string): Promise<unknown> => {
    const response = await this._httpRequest.post<unknown>('/api/social/follow', {
      userId,
      targetUserId,
    });
    return response.data;
  };

  public unfollowUser = async (userId: string, targetUserId: string): Promise<unknown> => {
    const response = await this._httpRequest.post<unknown>('/api/social/unfollow', {
      userId,
      targetUserId,
    });
    return response.data;
  };
}

export default ProfileController;
