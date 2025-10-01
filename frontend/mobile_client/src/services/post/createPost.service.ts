import { PostController } from '@base/shared-api-controllers';
import { CreatePostData, Post } from '../post/types';
import { AuthService } from '../AuthService';

export async function createPost(
  postData: CreatePostData,
  deps: { controller: PostController; auth: AuthService },
): Promise<Post> {
  const currentUser = await deps.auth.getCurrentUser();
  if (!currentUser || !currentUser.token) throw new Error('User not authenticated');

  deps.controller.setAccessToken(currentUser.token);

  // Local helpers (previously from domain) kept simple here
  const normalizeHashtags = (tags?: string[]) =>
    (tags || [])
      .map((t) => (t.startsWith('#') ? t : `#${t}`))
      .filter((t, i, arr) => t && arr.indexOf(t) === i);

  const payload = {
    journeyId: postData.journeyId,
    content: postData.content || postData.title || '',
    hashtags: normalizeHashtags(postData.tags),
    mediaFiles: [],
    isMilestone: false,
    progressDate: new Date().toISOString(),
  };

  const response = await deps.controller.createPost(payload as any);
  return ((response as any).post || response) as Post;
}
