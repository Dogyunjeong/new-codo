const testIDs = require('../../helpers/testIds');
const actions = require('../../helpers/actions');

describe('Feed Interactions', () => {
  beforeAll(async () => {
    await device.reloadReactNative();
    await actions.login('test@example.com', 'password123');
  });

  beforeEach(async () => {
    await actions.navigateToFeed();
  });

  it('should display feed posts', async () => {
    await expect(element(by.id(testIDs.feed.feedList))).toBeVisible();
    // Should have at least one post
    await expect(element(by.id(testIDs.feed.postCard('post-1')))).toBeVisible();
  });

  it('should refresh feed on pull down', async () => {
    await actions.refreshFeed();
    // Feed should refresh without errors
    await expect(element(by.id(testIDs.feed.feedList))).toBeVisible();
  });

  it('should load more posts on scroll', async () => {
    // Scroll to bottom
    await actions.scrollToBottom();
    
    // Should load more posts (pagination)
    await waitFor(element(by.text('Loading more...')))
      .toNotExist()
      .withTimeout(3000);
  });

  it('should like a post', async () => {
    const postId = 'post-1';
    
    // Like the post
    await element(by.id(testIDs.feed.likeButton(postId))).tap();
    
    // Like button should change state
    await expect(element(by.id(testIDs.feed.likeButton(postId)))).toHaveLabel('liked');
    
    // Unlike the post
    await element(by.id(testIDs.feed.likeButton(postId))).tap();
    await expect(element(by.id(testIDs.feed.likeButton(postId)))).toHaveLabel('like');
  });

  it('should open comment section', async () => {
    const postId = 'post-1';
    
    await element(by.id(testIDs.feed.commentButton(postId))).tap();
    
    // Comment modal should open
    await expect(element(by.text('Comments'))).toBeVisible();
    await expect(element(by.id('comment-input'))).toBeVisible();
    
    // Close comments
    await element(by.id(testIDs.common.modalCloseButton)).tap();
  });

  it('should add a comment', async () => {
    const postId = 'post-1';
    
    // Open comments
    await element(by.id(testIDs.feed.commentButton(postId))).tap();
    
    // Add comment
    await actions.commentOnPost(postId, 'Great post!');
    
    // Comment should appear
    await expect(element(by.text('Great post!'))).toBeVisible();
    
    // Close comments
    await element(by.id(testIDs.common.modalCloseButton)).tap();
  });

  it('should relate to a post', async () => {
    const postId = 'post-1';
    
    await element(by.id(testIDs.feed.relateButton(postId))).tap();
    
    // Relate button should change state
    await expect(element(by.id(testIDs.feed.relateButton(postId)))).toHaveLabel('related');
    
    // Un-relate
    await element(by.id(testIDs.feed.relateButton(postId))).tap();
    await expect(element(by.id(testIDs.feed.relateButton(postId)))).toHaveLabel('relate');
  });

  it('should open post menu', async () => {
    const postId = 'post-1';
    
    await element(by.id(testIDs.feed.moreButton(postId))).tap();
    
    // Menu options should appear
    await expect(element(by.text('Share'))).toBeVisible();
    await expect(element(by.text('Save'))).toBeVisible();
    await expect(element(by.text('Report'))).toBeVisible();
    
    // Dismiss menu
    await element(by.id(testIDs.common.modalOverlay)).tap();
  });

  it('should share a post', async () => {
    const postId = 'post-1';
    
    await element(by.id(testIDs.feed.moreButton(postId))).tap();
    await element(by.text('Share')).tap();
    
    // Share sheet should appear (platform specific)
    // Close share sheet
    if (device.getPlatform() === 'ios') {
      await element(by.label('Close')).tap();
    } else {
      await device.pressBack();
    }
  });

  it('should save a post', async () => {
    const postId = 'post-1';
    
    await element(by.id(testIDs.feed.moreButton(postId))).tap();
    await element(by.text('Save')).tap();
    
    // Should show confirmation
    await expect(element(by.text('Post saved'))).toBeVisible();
  });

  it('should navigate to user profile from post', async () => {
    const postId = 'post-1';
    
    // Tap on user avatar or name
    await element(by.id(`${postId}-author-avatar`)).tap();
    
    // Should navigate to user profile
    await expect(element(by.id(testIDs.profile.header))).toBeVisible();
    
    // Navigate back
    await element(by.id(testIDs.common.backButton)).tap();
  });

  it('should handle empty feed state', async () => {
    // Switch to a tab that might be empty
    await element(by.id(testIDs.feed.tab('discover'))).tap();
    
    // If no posts, should show empty state
    if (await element(by.id(testIDs.common.emptyState)).exists()) {
      await expect(element(by.text('No posts yet'))).toBeVisible();
      await expect(element(by.text('Be the first to share your journey!'))).toBeVisible();
    }
  });
});