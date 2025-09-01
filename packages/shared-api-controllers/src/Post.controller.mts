import { HttpRequest, IRequest } from '@base/shared-utils';

class PostController {
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

  // Post Domain
  public getRecentPosts = async (): Promise<unknown> => {
    try {
      // v0.1 preferred route
      const response = await this._httpRequest.get<unknown>('/api/posts');
      return response.data;
    } catch (e) {
      // Legacy fallback
      const response = await this._httpRequest.get<unknown>('/api/posts/recent');
      return response.data;
    }
  };

  public getUserPosts = async (userId: string): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>(`/api/posts/user/${userId}`);
    return response.data;
  };

  public getGoalPosts = async (goalId: string): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>(`/api/posts/goal/${goalId}`);
    return response.data;
  };

  public getPost = async (postId: string): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>(`/api/posts/${postId}`);
    return response.data;
  };

  public searchPostsByHashtag = async (hashtag: string): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>(`/api/posts/hashtag/${hashtag}`);
    return response.data;
  };

  public createPost = async (postData: any): Promise<unknown> => {
    const response = await this._httpRequest.post<unknown>('/api/posts', postData);
    return response.data;
  };

  public updatePost = async (postId: string, postData: any): Promise<unknown> => {
    const response = await this._httpRequest.put<unknown>(`/api/posts/${postId}`, postData);
    return response.data;
  };

  public deletePost = async (postId: string): Promise<unknown> => {
    const response = await this._httpRequest.delete<unknown>(`/api/posts/${postId}`);
    return response.data;
  };

  // Media Domain
  public uploadMedia = async (mediaData: any): Promise<unknown> => {
    const response = await this._httpRequest.post<unknown>('/api/media/upload', mediaData);
    return response.data;
  };

  public getMedia = async (mediaId: string): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>(`/api/media/${mediaId}`);
    return response.data;
  };

  public deleteMedia = async (mediaId: string): Promise<unknown> => {
    const response = await this._httpRequest.delete<unknown>(`/api/media/${mediaId}`);
    return response.data;
  };

  // Interaction Domain
  public getPostComments = async (postId: string): Promise<unknown> => {
    try {
      const response = await this._httpRequest.get<any>(`/api/posts/${postId}/comments`);
      const data = response.data as any;
      const items = (data && (data.items || data.comments)) || [];
      return { items, comments: items, pagination: data?.pagination };
    } catch (e) {
      const response = await this._httpRequest.get<any>(`/api/interactions/posts/${postId}/comments`);
      const data = response.data as any;
      const items = (data && (data.items || data.comments)) || [];
      return { items, comments: items, pagination: data?.pagination };
    }
  };

  public getPostLikes = async (postId: string): Promise<unknown> => {
    try {
      const response = await this._httpRequest.get<any>(`/api/posts/${postId}/likes`);
      const data = response.data as any;
      const items = (data && (Array.isArray(data) ? data : data.items)) || [];
      return { items, likes: items, pagination: data?.pagination };
    } catch (e) {
      const response = await this._httpRequest.get<any>(`/api/interactions/posts/${postId}/likes`);
      const data = response.data as any;
      const items = (data && (Array.isArray(data) ? data : data.items)) || [];
      return { items, likes: items, pagination: data?.pagination };
    }
  };

  public getUserLikes = async (userId: string): Promise<unknown> => {
    const response = await this._httpRequest.get<unknown>(`/api/interactions/users/${userId}/likes`);
    return response.data;
  };

  public addComment = async (postId: string, commentData: any): Promise<unknown> => {
    try {
      const response = await this._httpRequest.post<unknown>(
        `/api/posts/${postId}/comments`,
        commentData,
      );
      return response.data;
    } catch (e) {
      const response = await this._httpRequest.post<unknown>(
        `/api/interactions/posts/${postId}/comments`,
        commentData,
      );
      return response.data;
    }
  };

  public likePost = async (postId: string, userId: string): Promise<unknown> => {
    try {
      const response = await this._httpRequest.post<unknown>(`/api/posts/${postId}/like`, {
        userId,
      });
      return response.data;
    } catch (e) {
      const response = await this._httpRequest.post<unknown>(`/api/interactions/posts/${postId}/like`, {
        userId,
      });
      return response.data;
    }
  };

  public unlikePost = async (postId: string, userId: string): Promise<unknown> => {
    try {
      const response = await this._httpRequest.delete<unknown>(`/api/posts/${postId}/like`, {
        userId,
      });
      return response.data;
    } catch (e) {
      const response = await this._httpRequest.delete<unknown>(`/api/interactions/posts/${postId}/like`, {
        userId,
      });
      return response.data;
    }
  };
}

export default PostController;
