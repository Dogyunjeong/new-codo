import { PostController } from '@base/shared-api-controllers';
import { Post } from '../post/types';
import { AuthService } from '../AuthService';

export async function updatePost(
  postId: string,
  updates: Partial<Post>,
  deps: { controller: PostController; auth: AuthService },
): Promise<Post> {
  const currentUser = await deps.auth.getCurrentUser();
  if (!currentUser || !currentUser.token) throw new Error('User not authenticated');
  deps.controller.setAccessToken(currentUser.token);
  const response = await deps.controller.updatePost(postId, updates as any);
  return ((response as any).post || response) as Post;
}

export async function likePost(
  postId: string,
  deps: { controller: PostController; auth: AuthService },
): Promise<any> {
  const currentUser = await deps.auth.getCurrentUser();
  if (!currentUser) throw new Error('User not authenticated');
  return deps.controller.likePost(postId, currentUser.userId);
}

