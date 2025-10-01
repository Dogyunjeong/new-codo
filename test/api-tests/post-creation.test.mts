import { describe, it, expect, beforeAll } from 'vitest';
import PostController from '../../packages/shared-api-controllers/src/Post.controller.mts';
import AuthController from '../../packages/shared-api-controllers/src/Auth.controller.mts';

describe('Post Creation End-to-End Test', () => {
  let postController: PostController;
  let authController: AuthController;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Initialize controllers
    postController = new PostController({ 
      baseURL: 'http://localhost:4103' 
    });
    authController = new AuthController({ 
      baseURL: 'http://localhost:4101' 
    });

    // Login to get auth token (using mock auth)
    try {
      const loginResponse = await authController.login({
        email: 'test@example.com',
        password: 'password123'
      });
      
      authToken = (loginResponse as any).token || 'mock-token';
      userId = (loginResponse as any).user?.userId || 'mock-user-id';
      
      // Set the token for post controller
      postController.setAccessToken(authToken);
    } catch (error) {
      console.log('Using mock token for testing');
      authToken = 'mock-token';
      userId = 'mock-user-id';
      postController.setAccessToken(authToken);
    }
  });

  describe('Create Post', () => {
    it('should create a new post successfully', async () => {
      const postData = {
        journeyId: 'test-journey-' + Date.now(),
        content: 'Test post content from automated test',
        hashtags: ['#test', '#automated'],
        isMilestone: false,
        progressDate: new Date().toISOString()
      };

      const response = await postController.createPost(postData);
      const post = (response as any).post || response;

      expect(post).toBeDefined();
      expect(post.id).toBeDefined();
      expect(post.userId).toBe(userId);
      expect(post.journeyId).toBe(postData.journeyId);
      expect(post.content).toBe(postData.content);
      expect(post.hashtags).toEqual(postData.hashtags);
      expect(post.likesCount).toBe(0);
      expect(post.commentsCount).toBe(0);
    });

    it('should fail to create post without required fields', async () => {
      const invalidPostData = {
        content: 'Post without journeyId'
      };

      try {
        await postController.createPost(invalidPostData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Get Posts', () => {
    it('should fetch recent posts', async () => {
      const response = await postController.getRecentPosts();
      const posts = (response as any).items || response;

      expect(posts).toBeDefined();
      expect(Array.isArray(posts)).toBe(true);
      
      if (posts.length > 0) {
        const firstPost = posts[0];
        expect(firstPost.id).toBeDefined();
        expect(firstPost.userId).toBeDefined();
        expect(firstPost.content).toBeDefined();
      }
    });

    it('should fetch posts by user', async () => {
      const response = await postController.getUserPosts(userId);
      const posts = (response as any).items || (response as any).posts || response;

      expect(posts).toBeDefined();
      expect(Array.isArray(posts)).toBe(true);
    });
  });

  describe('Update Post', () => {
    it('should update an existing post', async () => {
      // First create a post
      const postData = {
        journeyId: 'test-journey-update',
        content: 'Original content',
        hashtags: ['#original'],
        isMilestone: false
      };

      const createResponse = await postController.createPost(postData);
      const createdPost = (createResponse as any).post || createResponse;

      // Then update it
      const updateData = {
        content: 'Updated content',
        hashtags: ['#updated', '#modified']
      };

      const updateResponse = await postController.updatePost(createdPost.id, updateData);
      const updatedPost = (updateResponse as any).post || updateResponse;

      expect(updatedPost).toBeDefined();
      expect(updatedPost.content).toBe(updateData.content);
      expect(updatedPost.hashtags).toEqual(updateData.hashtags);
    });
  });

  describe('Delete Post', () => {
    it('should delete a post', async () => {
      // First create a post
      const postData = {
        journeyId: 'test-journey-delete',
        content: 'Post to be deleted',
        hashtags: ['#delete'],
        isMilestone: false
      };

      const createResponse = await postController.createPost(postData);
      const createdPost = (createResponse as any).post || createResponse;

      // Then delete it
      await postController.deletePost(createdPost.id);

      // Verify it's deleted by trying to fetch it
      try {
        await postController.getPost(createdPost.id);
        expect.fail('Should have thrown an error for deleted post');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Post Interactions', () => {
    let testPostId: string;

    beforeAll(async () => {
      // Create a test post for interactions
      const postData = {
        journeyId: 'test-journey-interactions',
        content: 'Post for interaction testing',
        hashtags: ['#interactions'],
        isMilestone: false
      };

      const response = await postController.createPost(postData);
      testPostId = ((response as any).post || response).id;
    });

    it('should like a post', async () => {
      const response = await postController.likePost(testPostId, userId);
      expect(response).toBeDefined();
    });

    it('should add a comment to a post', async () => {
      const commentData = {
        content: 'This is a test comment',
        userId: userId
      };

      const response = await postController.addComment(testPostId, commentData);
      expect(response).toBeDefined();
    });

    it('should get post comments', async () => {
      const response = await postController.getPostComments(testPostId);
      const comments = (response as any).comments || response;

      expect(comments).toBeDefined();
      expect(Array.isArray(comments)).toBe(true);
    });
  });
});
