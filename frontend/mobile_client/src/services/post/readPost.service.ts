import { PostController } from '@base/shared-api-controllers';
import { Post } from '../post/types';
import { AuthService } from '../AuthService';
import { SecureStorage } from '../storage/SecureStorage';

export async function getPosts(
  userId: string | undefined,
  deps: { controller: PostController; auth: AuthService },
): Promise<Post[]> {
  // Get the auth token from secure storage
  const token = await SecureStorage.getAuthToken();
  if (token) {
    deps.controller.setAccessToken(token);
  }

  const response = userId
    ? await deps.controller.getUserPosts(userId)
    : await deps.controller.getRecentPosts();

  const items = (response as any).items || (response as any).posts || response || [];
  return items as Post[];
}

export async function getPostById(
  postId: string,
  deps: { controller: PostController },
): Promise<Post | undefined> {
  // Get the auth token from secure storage
  const token = await SecureStorage.getAuthToken();
  if (token) {
    deps.controller.setAccessToken(token);
  }
  
  const response = await deps.controller.getPost(postId);
  return ((response as any).post || response) as Post;
}

