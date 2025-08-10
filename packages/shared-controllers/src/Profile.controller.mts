import { HttpRequest, IRequest } from '@base/shared-utils';

class ProfileController {
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
    const response = await this._httpRequest.get<unknown>('/profiles/health');
    return response.data;
  };

  // Profile Domain
  public getUserProfile = async (userId: string): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>(`/profiles/${userId}`);
    return response.data;
  };

  public updateProfile = async (userId: string, profileData: any): Promise<unknown> => {
    const response = await this._httpRequest.put<unknown>(`/profiles/${userId}`, profileData);
    return response.data;
  };

  public deleteProfile = async (userId: string): Promise<unknown> => {
    const response = await this._httpRequest.delete<unknown>(`/profiles/${userId}`);
    return response.data;
  };

  // Goal Domain
  public getUserGoals = async (userId: string): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>(`/goals/user/${userId}`);
    return response.data;
  };

  public getGoal = async (goalId: string): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>(`/goals/${goalId}`);
    return response.data;
  };

  public createGoal = async (goalData: any): Promise<unknown> => {
    const response = await this._httpRequest.post<unknown>('/goals', goalData);
    return response.data;
  };

  public updateGoal = async (goalId: string, goalData: any): Promise<unknown> => {
    const response = await this._httpRequest.put<unknown>(`/goals/${goalId}`, goalData);
    return response.data;
  };

  public deleteGoal = async (goalId: string): Promise<unknown> => {
    const response = await this._httpRequest.delete<unknown>(`/goals/${goalId}`);
    return response.data;
  };

  // Social Domain
  public getFollowers = async (userId: string): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>(`/social/followers/${userId}`);
    return response.data;
  };

  public getFollowing = async (userId: string): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>(`/social/following/${userId}`);
    return response.data;
  };

  public getRelationship = async (userId: string): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>(`/social/relationship/${userId}`);
    return response.data;
  };

  public followUser = async (userId: string, targetUserId: string): Promise<unknown> => {
    const response = await this._httpRequest.post<unknown>('/social/follow', {
      userId,
      targetUserId,
    });
    return response.data;
  };

  public unfollowUser = async (userId: string, targetUserId: string): Promise<unknown> => {
    const response = await this._httpRequest.post<unknown>('/social/unfollow', {
      userId,
      targetUserId,
    });
    return response.data;
  };
}

export default ProfileController;
