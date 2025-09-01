import { PostController } from '@base/shared-api-controllers';
import { AuthService } from '../AuthService';

export async function deletePost(
  postId: string,
  deps: { controller: PostController; auth: AuthService },
): Promise<boolean> {
  const currentUser = await deps.auth.getCurrentUser();
  if (!currentUser || !currentUser.token) throw new Error('User not authenticated');
  deps.controller.setAccessToken(currentUser.token);
  await deps.controller.deletePost(postId);
  return true;
}

