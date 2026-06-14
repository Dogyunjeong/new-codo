import { PostData } from '../components/feed/PostCard'

export const mapRawPostToPostData = (post: any, fallbackUser?: { name?: string; avatar?: string }): PostData => {
  const nestedContent =
    post.content && typeof post.content === 'object'
      ? post.content
      : null
  const rawContent = typeof post.content === 'string'
    ? post.content
    : nestedContent?.content || ''
  const hashtags: string[] = post.hashtags || nestedContent?.hashtags || []
  const rawMedia = post.media || nestedContent?.media || post.mediaFiles || nestedContent?.mediaFiles
  const firstMedia = Array.isArray(rawMedia) ? rawMedia[0] : rawMedia
  const media = firstMedia?.url || firstMedia?.image || firstMedia?.uri
    ? {
        image: firstMedia.url || firstMedia.image || firstMedia.uri,
        caption: firstMedia.caption,
      }
    : undefined

  return {
    id: String(post.id || post._id || nestedContent?.id || ''),
    user: {
      name: post.user?.name || post.user?.username || post.userName || fallbackUser?.name || 'Unknown User',
      avatar:
        post.user?.avatar ||
        post.user?.profileImage ||
        post.userAvatar ||
        fallbackUser?.avatar ||
        'https://i.pravatar.cc/150',
      meta: post.user?.meta || post.userMeta || '',
    },
    categories: post.categories || [],
    title: post.title || nestedContent?.title || '',
    content: rawContent,
    steps: post.steps,
    media,
    tags: post.tags || hashtags.map((tag: string) => ({
      label: tag.startsWith('#') ? tag : `#${tag}`,
      type: 'hashtag',
    })),
    engagement: post.engagement || {
      likes: post.socialStats?.likesCount || post.likesCount || 0,
      comments: post.socialStats?.commentsCount || post.commentsCount || 0,
      relates: 0,
      isLiked: false,
    },
    inspiredBy: post.inspiredBy,
  }
}

export const mapRawPostsToPostData = (posts: any[], fallbackUser?: { name?: string; avatar?: string }): PostData[] =>
  posts.map((post) => mapRawPostToPostData(post, fallbackUser))
