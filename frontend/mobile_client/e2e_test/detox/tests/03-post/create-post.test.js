const testIDs = require('../../helpers/testIds');
const actions = require('../../helpers/actions');

describe('Create Post', () => {
  beforeAll(async () => {
    await device.reloadReactNative();
    await actions.login('test@example.com', 'password123');
  });

  beforeEach(async () => {
    // Navigate to create tab
    await element(by.id(testIDs.navigation.createTab)).tap();
  });

  it('should show create post screen', async () => {
    await expect(element(by.id(testIDs.post.textInput))).toBeVisible();
    await expect(element(by.id(testIDs.post.mediaButton))).toBeVisible();
    await expect(element(by.id(testIDs.post.categorySelector))).toBeVisible();
    await expect(element(by.id(testIDs.post.submitButton))).toBeVisible();
    await expect(element(by.id(testIDs.post.cancelButton))).toBeVisible();
  });

  it('should create a text-only post', async () => {
    const postContent = `Test post ${Date.now()}`;
    
    await actions.createPost(null, postContent);
    
    // Should navigate back to feed
    await expect(element(by.id(testIDs.feed.feedList))).toBeVisible();
    
    // New post should appear in feed
    await expect(element(by.text(postContent))).toBeVisible();
  });

  it('should create a post with title', async () => {
    await element(by.id(testIDs.navigation.createTab)).tap();
    
    const title = 'My Journey Step';
    const content = 'This is an important milestone in my journey.';
    
    await actions.createPost(title, content);
    
    // Post should appear with title
    await expect(element(by.text(title))).toBeVisible();
    await expect(element(by.text(content))).toBeVisible();
  });

  it('should select post category', async () => {
    await element(by.id(testIDs.navigation.createTab)).tap();
    
    const content = 'Fitness achievement post';
    
    await element(by.id(testIDs.post.textInput)).typeText(content);
    
    // Select category
    await element(by.id(testIDs.post.categorySelector)).tap();
    await element(by.id(testIDs.post.categoryOption('fitness'))).tap();
    
    // Submit post
    await element(by.id(testIDs.post.submitButton)).tap();
    
    // Post should have category tag
    await waitFor(element(by.text('Fitness')))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should add media from gallery', async () => {
    await element(by.id(testIDs.navigation.createTab)).tap();
    
    await element(by.id(testIDs.post.textInput)).typeText('Post with image');
    
    // Open media options
    await element(by.id(testIDs.post.mediaButton)).tap();
    await element(by.id(testIDs.post.galleryButton)).tap();
    
    // Select first image (mock)
    await element(by.id('gallery-image-0')).tap();
    await element(by.text('Choose')).tap();
    
    // Image should be added
    await expect(element(by.id('media-preview-0'))).toBeVisible();
    
    // Submit post
    await element(by.id(testIDs.post.submitButton)).tap();
    
    // Post with image should appear
    await expect(element(by.text('Post with image'))).toBeVisible();
  });

  it('should take photo with camera', async () => {
    await element(by.id(testIDs.navigation.createTab)).tap();
    
    await element(by.id(testIDs.post.textInput)).typeText('Post with camera photo');
    
    // Open camera
    await element(by.id(testIDs.post.mediaButton)).tap();
    await element(by.id(testIDs.post.cameraButton)).tap();
    
    // Take photo (mock)
    await element(by.id('camera-capture-button')).tap();
    await element(by.text('Use Photo')).tap();
    
    // Photo should be added
    await expect(element(by.id('media-preview-0'))).toBeVisible();
    
    // Submit post
    await element(by.id(testIDs.post.submitButton)).tap();
  });

  it('should remove selected media', async () => {
    await element(by.id(testIDs.navigation.createTab)).tap();
    
    // Add media
    await element(by.id(testIDs.post.mediaButton)).tap();
    await element(by.id(testIDs.post.galleryButton)).tap();
    await element(by.id('gallery-image-0')).tap();
    await element(by.text('Choose')).tap();
    
    // Media should be added
    await expect(element(by.id('media-preview-0'))).toBeVisible();
    
    // Remove media
    await element(by.id(testIDs.post.deleteMediaButton(0))).tap();
    
    // Media should be removed
    await expect(element(by.id('media-preview-0'))).toNotExist();
  });

  it('should show error for empty post', async () => {
    await element(by.id(testIDs.navigation.createTab)).tap();
    
    // Try to submit empty post
    await element(by.id(testIDs.post.submitButton)).tap();
    
    await expect(element(by.text('Please add some content'))).toBeVisible();
  });

  it('should show character limit warning', async () => {
    await element(by.id(testIDs.navigation.createTab)).tap();
    
    // Type long text (assuming 500 char limit)
    const longText = 'a'.repeat(480);
    await element(by.id(testIDs.post.textInput)).typeText(longText);
    
    // Should show character count
    await expect(element(by.text('480/500'))).toBeVisible();
    
    // Type more to reach limit
    await element(by.id(testIDs.post.textInput)).typeText('b'.repeat(20));
    
    // Should show limit reached
    await expect(element(by.text('500/500'))).toBeVisible();
  });

  it('should cancel post creation', async () => {
    await element(by.id(testIDs.navigation.createTab)).tap();
    
    // Add content
    await element(by.id(testIDs.post.textInput)).typeText('Draft post');
    
    // Cancel
    await element(by.id(testIDs.post.cancelButton)).tap();
    
    // Should show confirmation dialog
    await expect(element(by.text('Discard post?'))).toBeVisible();
    await element(by.text('Discard')).tap();
    
    // Should navigate back
    await expect(element(by.id(testIDs.feed.feedList))).toBeVisible();
  });

  it('should save draft when canceling', async () => {
    await element(by.id(testIDs.navigation.createTab)).tap();
    
    // Add content
    await element(by.id(testIDs.post.textInput)).typeText('Draft to save');
    
    // Cancel
    await element(by.id(testIDs.post.cancelButton)).tap();
    
    // Choose to save draft
    await element(by.text('Save Draft')).tap();
    
    // Navigate back to create
    await element(by.id(testIDs.navigation.createTab)).tap();
    
    // Draft should be loaded
    await expect(element(by.text('Draft to save'))).toBeVisible();
  });

  it('should handle network error during post creation', async () => {
    await element(by.id(testIDs.navigation.createTab)).tap();
    
    // Simulate offline (if possible in test environment)
    await device.setURLBlacklist(['.*']);
    
    await element(by.id(testIDs.post.textInput)).typeText('Offline post');
    await element(by.id(testIDs.post.submitButton)).tap();
    
    // Should show error
    await expect(element(by.text('Failed to create post. Please try again.'))).toBeVisible();
    
    // Re-enable network
    await device.clearURLBlacklist();
  });
});