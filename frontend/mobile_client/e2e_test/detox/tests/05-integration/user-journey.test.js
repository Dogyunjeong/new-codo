const testIDs = require('../../helpers/testIds');
const actions = require('../../helpers/actions');

describe('Complete User Journey', () => {
  const timestamp = Date.now();
  const newUserEmail = `newuser${timestamp}@example.com`;
  const newUserName = `TestUser${timestamp}`;
  
  it('should complete full user journey from signup to creating content', async () => {
    await device.reloadReactNative();
    
    // Step 1: Sign up as new user
    await element(by.text('Sign Up')).tap();
    await actions.signup(newUserName, newUserEmail, 'password123');
    
    // Should navigate to feed after signup
    await waitFor(element(by.id(testIDs.feed.feedList)))
      .toBeVisible()
      .withTimeout(5000);
    
    // Step 2: Complete profile setup
    await actions.navigateToProfile();
    await element(by.id(testIDs.profile.editButton)).tap();
    
    // Add bio
    await element(by.id('edit-bio-input')).typeText('New to Ziririt! Excited to share my journey.');
    
    // Add profile picture
    await element(by.id('edit-avatar-button')).tap();
    await element(by.text('Choose from Gallery')).tap();
    await element(by.id('gallery-image-0')).tap();
    await element(by.text('Choose')).tap();
    
    await element(by.text('Save')).tap();
    
    // Step 3: Create first post
    await element(by.id(testIDs.navigation.createTab)).tap();
    await actions.createPost('My First Step', 'Starting my journey on Ziririt!', 'personal');
    
    // Step 4: Interact with feed
    await actions.navigateToFeed();
    
    // Like a post
    await element(by.id(testIDs.feed.likeButton('post-1'))).tap();
    
    // Comment on a post
    await actions.commentOnPost('post-1', 'Great inspiration!');
    
    // Step 5: Follow another user
    await element(by.id('post-1-author-avatar')).tap();
    await element(by.id(testIDs.profile.followButton)).tap();
    
    // Navigate back to feed
    await element(by.id(testIDs.common.backButton)).tap();
    
    // Step 6: Check notifications
    await element(by.id(testIDs.feed.notificationButton)).tap();
    await expect(element(by.text('Notifications'))).toBeVisible();
    await element(by.id(testIDs.common.backButton)).tap();
    
    // Step 7: Verify content in profile
    await actions.navigateToProfile();
    
    // Should see the post we created
    await expect(element(by.text('My First Step'))).toBeVisible();
    
    // Should see updated stats
    await expect(element(by.id(testIDs.profile.postsCount))).toHaveText('1');
    await expect(element(by.id(testIDs.profile.followingCount))).toHaveText('1');
  });
});

describe('Content Discovery Flow', () => {
  beforeAll(async () => {
    await device.reloadReactNative();
    await actions.login('test@example.com', 'password123');
  });
  
  it('should discover and interact with content across app', async () => {
    // Start in feed
    await actions.navigateToFeed();
    
    // Switch to trending tab
    await element(by.id(testIDs.feed.tab('trending'))).tap();
    
    // Find trending post and save it
    await element(by.id(testIDs.feed.moreButton('post-trending-1'))).tap();
    await element(by.text('Save')).tap();
    
    // Navigate to discover tab
    await element(by.id(testIDs.navigation.discoverTab)).tap();
    
    // Search for content
    await element(by.id('search-input')).typeText('fitness');
    await element(by.id('search-button')).tap();
    
    // Filter results
    await element(by.id('filter-button')).tap();
    await element(by.text('This Week')).tap();
    await element(by.text('Apply')).tap();
    
    // Open a result
    await element(by.id('search-result-0')).tap();
    
    // Relate to the post
    await element(by.id(testIDs.feed.relateButton('search-post-1'))).tap();
    
    // Navigate to journey tab
    await element(by.id(testIDs.navigation.journeyTab)).tap();
    
    // Start a new journey
    await element(by.id('start-journey-button')).tap();
    await element(by.text('Fitness')).tap();
    await element(by.id('journey-title-input')).typeText('My Fitness Journey');
    await element(by.id('journey-goal-input')).typeText('Run a marathon');
    await element(by.text('Create Journey')).tap();
    
    // Add milestone to journey
    await element(by.id('add-milestone-button')).tap();
    await element(by.id('milestone-title-input')).typeText('First 5K');
    await element(by.id('milestone-date-picker')).tap();
    await element(by.text('30')).tap(); // Select date
    await element(by.text('Set Milestone')).tap();
    
    // Verify journey appears in profile
    await actions.navigateToProfile();
    await element(by.id(testIDs.profile.journeysTab)).tap();
    await expect(element(by.text('My Fitness Journey'))).toBeVisible();
  });
});

describe('Social Interactions Flow', () => {
  beforeAll(async () => {
    await device.reloadReactNative();
    await actions.login('test@example.com', 'password123');
  });
  
  it('should handle complex social interactions', async () => {
    // Create a post with multiple media
    await element(by.id(testIDs.navigation.createTab)).tap();
    
    await element(by.id(testIDs.post.textInput)).typeText('Check out my progress!');
    
    // Add multiple images
    await element(by.id(testIDs.post.mediaButton)).tap();
    await element(by.id(testIDs.post.galleryButton)).tap();
    await element(by.id('gallery-image-0')).tap();
    await element(by.id('gallery-image-1')).tap();
    await element(by.id('gallery-image-2')).tap();
    await element(by.text('Choose')).tap();
    
    await element(by.id(testIDs.post.submitButton)).tap();
    
    // Navigate to feed
    await actions.navigateToFeed();
    
    // Find our post and share it
    await element(by.id(testIDs.feed.moreButton('my-post-1'))).tap();
    await element(by.text('Share')).tap();
    await element(by.text('Share to Story')).tap();
    
    // Add text to story
    await element(by.id('story-text-input')).typeText('Proud of this!');
    await element(by.text('Share Story')).tap();
    
    // Check story appears in story bar
    await expect(element(by.id('my-story'))).toBeVisible();
    
    // View someone else's story
    await element(by.id('user-story-1')).tap();
    
    // React to story
    await element(by.id('story-react-button')).tap();
    await element(by.text('🔥')).tap();
    
    // Reply to story
    await element(by.id('story-reply-input')).typeText('Amazing progress!');
    await element(by.id('story-send-button')).tap();
    
    // Close story viewer
    await element(by.id('story-close-button')).tap();
    
    // Check messages for story reply
    await element(by.id(testIDs.feed.messageButton)).tap();
    await expect(element(by.text('Story reply sent'))).toBeVisible();
  });
});

describe('Error Recovery Flow', () => {
  beforeAll(async () => {
    await device.reloadReactNative();
    await actions.login('test@example.com', 'password123');
  });
  
  it('should handle network errors gracefully', async () => {
    // Simulate offline mode
    await device.setURLBlacklist(['.*']);
    
    // Try to create post offline
    await element(by.id(testIDs.navigation.createTab)).tap();
    await element(by.id(testIDs.post.textInput)).typeText('Offline post');
    await element(by.id(testIDs.post.submitButton)).tap();
    
    // Should show offline message
    await expect(element(by.text('You are offline'))).toBeVisible();
    await expect(element(by.text('Post will be shared when connection is restored'))).toBeVisible();
    
    // Re-enable network
    await device.clearURLBlacklist();
    
    // Should auto-retry and succeed
    await waitFor(element(by.text('Post shared successfully')))
      .toBeVisible()
      .withTimeout(5000);
    
    // Verify post appears in feed
    await actions.navigateToFeed();
    await actions.refreshFeed();
    await expect(element(by.text('Offline post'))).toBeVisible();
  });
  
  it('should handle app crash recovery', async () => {
    // Create draft post
    await element(by.id(testIDs.navigation.createTab)).tap();
    await element(by.id(testIDs.post.textInput)).typeText('Important draft content');
    
    // Simulate app crash
    await device.terminateApp();
    await device.launchApp({ newInstance: false });
    
    // Should restore session
    await waitFor(element(by.id(testIDs.feed.feedList)))
      .toBeVisible()
      .withTimeout(5000);
    
    // Check if draft was saved
    await element(by.id(testIDs.navigation.createTab)).tap();
    
    // Should show draft recovery option
    if (await element(by.text('Restore Draft')).exists()) {
      await element(by.text('Restore Draft')).tap();
      await expect(element(by.text('Important draft content'))).toBeVisible();
    }
  });
});

describe('Performance Tests', () => {
  beforeAll(async () => {
    await device.reloadReactNative();
    await actions.login('test@example.com', 'password123');
  });
  
  it('should handle rapid navigation smoothly', async () => {
    // Rapidly switch between tabs
    for (let i = 0; i < 5; i++) {
      await element(by.id(testIDs.navigation.homeTab)).tap();
      await element(by.id(testIDs.navigation.discoverTab)).tap();
      await element(by.id(testIDs.navigation.journeyTab)).tap();
      await element(by.id(testIDs.navigation.profileTab)).tap();
    }
    
    // App should remain responsive
    await expect(element(by.id(testIDs.profile.header))).toBeVisible();
  });
  
  it('should handle large amounts of content', async () => {
    await actions.navigateToFeed();
    
    // Scroll through many posts quickly
    for (let i = 0; i < 10; i++) {
      await element(by.id(testIDs.feed.feedList)).swipe('up', 'fast');
      await actions.sleep(100);
    }
    
    // App should still be responsive
    await actions.refreshFeed();
    await expect(element(by.id(testIDs.feed.feedList))).toBeVisible();
  });
});