const testIDs = require('../../helpers/testIds');
const actions = require('../../helpers/actions');

describe('Profile Edit', () => {
  beforeAll(async () => {
    await device.reloadReactNative();
    await actions.login('test@example.com', 'password123');
  });

  beforeEach(async () => {
    await actions.navigateToProfile();
    await element(by.id(testIDs.profile.editButton)).tap();
  });

  afterEach(async () => {
    // Cancel or save changes
    if (await element(by.text('Cancel')).exists()) {
      await element(by.text('Cancel')).tap();
    }
  });

  it('should open edit profile screen', async () => {
    await expect(element(by.text('Edit Profile'))).toBeVisible();
    await expect(element(by.id('edit-name-input'))).toBeVisible();
    await expect(element(by.id('edit-bio-input'))).toBeVisible();
    await expect(element(by.id('edit-avatar-button'))).toBeVisible();
    await expect(element(by.text('Save'))).toBeVisible();
    await expect(element(by.text('Cancel'))).toBeVisible();
  });

  it('should update display name', async () => {
    const newName = `User ${Date.now()}`;
    
    await element(by.id('edit-name-input')).clearText();
    await element(by.id('edit-name-input')).typeText(newName);
    await element(by.text('Save')).tap();
    
    // Should return to profile with updated name
    await expect(element(by.text(newName))).toBeVisible();
  });

  it('should update bio', async () => {
    await element(by.id(testIDs.profile.editButton)).tap();
    
    const newBio = 'Updated bio text for testing';
    
    await element(by.id('edit-bio-input')).clearText();
    await element(by.id('edit-bio-input')).typeText(newBio);
    await element(by.text('Save')).tap();
    
    // Should return to profile with updated bio
    await expect(element(by.text(newBio))).toBeVisible();
  });

  it('should update profile picture from gallery', async () => {
    await element(by.id(testIDs.profile.editButton)).tap();
    
    await element(by.id('edit-avatar-button')).tap();
    await element(by.text('Choose from Gallery')).tap();
    
    // Select image
    await element(by.id('gallery-image-0')).tap();
    await element(by.text('Choose')).tap();
    
    // New avatar should be displayed
    await expect(element(by.id('edit-avatar-preview'))).toBeVisible();
    
    await element(by.text('Save')).tap();
    
    // Profile should update
    await expect(element(by.id(testIDs.profile.avatar))).toBeVisible();
  });

  it('should take new profile picture', async () => {
    await element(by.id(testIDs.profile.editButton)).tap();
    
    await element(by.id('edit-avatar-button')).tap();
    await element(by.text('Take Photo')).tap();
    
    // Take photo
    await element(by.id('camera-capture-button')).tap();
    await element(by.text('Use Photo')).tap();
    
    // New avatar should be displayed
    await expect(element(by.id('edit-avatar-preview'))).toBeVisible();
  });

  it('should validate display name', async () => {
    await element(by.id(testIDs.profile.editButton)).tap();
    
    // Clear name
    await element(by.id('edit-name-input')).clearText();
    await element(by.text('Save')).tap();
    
    // Should show error
    await expect(element(by.text('Name is required'))).toBeVisible();
  });

  it('should enforce bio character limit', async () => {
    await element(by.id(testIDs.profile.editButton)).tap();
    
    // Type long bio (assuming 160 char limit)
    const longBio = 'a'.repeat(150);
    await element(by.id('edit-bio-input')).clearText();
    await element(by.id('edit-bio-input')).typeText(longBio);
    
    // Should show character count
    await expect(element(by.text('150/160'))).toBeVisible();
    
    // Try to exceed limit
    await element(by.id('edit-bio-input')).typeText('b'.repeat(20));
    
    // Should be limited
    await expect(element(by.text('160/160'))).toBeVisible();
  });

  it('should cancel edit without saving', async () => {
    await element(by.id(testIDs.profile.editButton)).tap();
    
    const originalName = await element(by.id('edit-name-input')).getText();
    
    // Make changes
    await element(by.id('edit-name-input')).clearText();
    await element(by.id('edit-name-input')).typeText('Temporary Name');
    
    // Cancel
    await element(by.text('Cancel')).tap();
    
    // Should show confirmation
    await expect(element(by.text('Discard changes?'))).toBeVisible();
    await element(by.text('Discard')).tap();
    
    // Profile should not be updated
    await expect(element(by.text(originalName))).toBeVisible();
  });

  it('should add social links', async () => {
    await element(by.id(testIDs.profile.editButton)).tap();
    
    // Scroll to social links section
    await element(by.id('edit-profile-scroll')).swipe('up');
    
    await element(by.id('add-social-link')).tap();
    await element(by.text('Instagram')).tap();
    await element(by.id('instagram-username')).typeText('testuser');
    await element(by.text('Add')).tap();
    
    // Link should be added
    await expect(element(by.text('@testuser'))).toBeVisible();
    
    await element(by.text('Save')).tap();
  });

  it('should handle save errors', async () => {
    await element(by.id(testIDs.profile.editButton)).tap();
    
    // Simulate offline
    await device.setURLBlacklist(['.*']);
    
    await element(by.id('edit-name-input')).clearText();
    await element(by.id('edit-name-input')).typeText('Offline Name');
    await element(by.text('Save')).tap();
    
    // Should show error
    await expect(element(by.text('Failed to update profile'))).toBeVisible();
    
    // Re-enable network
    await device.clearURLBlacklist();
  });
});