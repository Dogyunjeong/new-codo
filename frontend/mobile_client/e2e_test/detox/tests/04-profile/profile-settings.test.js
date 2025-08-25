const testIDs = require('../../helpers/testIds');
const actions = require('../../helpers/actions');

describe('Profile Settings', () => {
  beforeAll(async () => {
    await device.reloadReactNative();
    await actions.login('test@example.com', 'password123');
  });

  beforeEach(async () => {
    await actions.navigateToProfile();
    await element(by.id(testIDs.profile.settingsButton)).tap();
  });

  afterEach(async () => {
    // Navigate back if still in settings
    if (await element(by.text('Settings')).exists()) {
      await element(by.id(testIDs.common.backButton)).tap();
    }
  });

  it('should display settings menu', async () => {
    await expect(element(by.text('Settings'))).toBeVisible();
    await expect(element(by.text('Account'))).toBeVisible();
    await expect(element(by.text('Privacy'))).toBeVisible();
    await expect(element(by.text('Notifications'))).toBeVisible();
    await expect(element(by.text('About'))).toBeVisible();
    await expect(element(by.text('Help & Support'))).toBeVisible();
    await expect(element(by.text('Logout'))).toBeVisible();
  });

  it('should navigate to account settings', async () => {
    await element(by.text('Account')).tap();
    
    await expect(element(by.text('Account Settings'))).toBeVisible();
    await expect(element(by.text('Email'))).toBeVisible();
    await expect(element(by.text('Password'))).toBeVisible();
    await expect(element(by.text('Delete Account'))).toBeVisible();
    
    await element(by.id(testIDs.common.backButton)).tap();
  });

  it('should change email', async () => {
    await element(by.text('Account')).tap();
    await element(by.text('Email')).tap();
    
    await expect(element(by.text('Change Email'))).toBeVisible();
    await expect(element(by.id('new-email-input'))).toBeVisible();
    await expect(element(by.id('confirm-password-input'))).toBeVisible();
    
    const newEmail = `newemail${Date.now()}@example.com`;
    await element(by.id('new-email-input')).typeText(newEmail);
    await element(by.id('confirm-password-input')).typeText('password123');
    await element(by.text('Update Email')).tap();
    
    // Should show confirmation
    await expect(element(by.text('Verification email sent'))).toBeVisible();
    
    await element(by.id(testIDs.common.backButton)).tap();
    await element(by.id(testIDs.common.backButton)).tap();
  });

  it('should change password', async () => {
    await element(by.text('Account')).tap();
    await element(by.text('Password')).tap();
    
    await expect(element(by.text('Change Password'))).toBeVisible();
    await expect(element(by.id('current-password-input'))).toBeVisible();
    await expect(element(by.id('new-password-input'))).toBeVisible();
    await expect(element(by.id('confirm-new-password-input'))).toBeVisible();
    
    await element(by.id('current-password-input')).typeText('password123');
    await element(by.id('new-password-input')).typeText('newPassword123');
    await element(by.id('confirm-new-password-input')).typeText('newPassword123');
    await element(by.text('Update Password')).tap();
    
    // Should show success
    await expect(element(by.text('Password updated successfully'))).toBeVisible();
    
    await element(by.id(testIDs.common.backButton)).tap();
    await element(by.id(testIDs.common.backButton)).tap();
  });

  it('should navigate to privacy settings', async () => {
    await element(by.text('Privacy')).tap();
    
    await expect(element(by.text('Privacy Settings'))).toBeVisible();
    await expect(element(by.text('Profile Visibility'))).toBeVisible();
    await expect(element(by.text('Blocked Users'))).toBeVisible();
    await expect(element(by.text('Data & Personalization'))).toBeVisible();
    
    await element(by.id(testIDs.common.backButton)).tap();
  });

  it('should toggle profile visibility', async () => {
    await element(by.text('Privacy')).tap();
    
    // Check current state
    const isPublic = await element(by.id('profile-public-switch')).getAttributes();
    
    // Toggle
    await element(by.id('profile-public-switch')).tap();
    
    // Should show confirmation
    if (isPublic) {
      await expect(element(by.text('Profile is now private'))).toBeVisible();
    } else {
      await expect(element(by.text('Profile is now public'))).toBeVisible();
    }
    
    await element(by.id(testIDs.common.backButton)).tap();
  });

  it('should navigate to notification settings', async () => {
    await element(by.text('Notifications')).tap();
    
    await expect(element(by.text('Notification Preferences'))).toBeVisible();
    await expect(element(by.text('Push Notifications'))).toBeVisible();
    await expect(element(by.text('Email Notifications'))).toBeVisible();
    await expect(element(by.text('In-App Notifications'))).toBeVisible();
    
    await element(by.id(testIDs.common.backButton)).tap();
  });

  it('should toggle push notifications', async () => {
    await element(by.text('Notifications')).tap();
    
    // Toggle push notifications
    await element(by.id('push-notifications-switch')).tap();
    
    // Should show change
    await expect(element(by.text('Push notifications updated'))).toBeVisible();
    
    await element(by.id(testIDs.common.backButton)).tap();
  });

  it('should show about information', async () => {
    await element(by.text('About')).tap();
    
    await expect(element(by.text('About Ziririt'))).toBeVisible();
    await expect(element(by.text('Version'))).toBeVisible();
    await expect(element(by.text('Terms of Service'))).toBeVisible();
    await expect(element(by.text('Privacy Policy'))).toBeVisible();
    
    await element(by.id(testIDs.common.backButton)).tap();
  });

  it('should navigate to help and support', async () => {
    await element(by.text('Help & Support')).tap();
    
    await expect(element(by.text('Help Center'))).toBeVisible();
    await expect(element(by.text('FAQs'))).toBeVisible();
    await expect(element(by.text('Contact Support'))).toBeVisible();
    await expect(element(by.text('Report a Problem'))).toBeVisible();
    
    await element(by.id(testIDs.common.backButton)).tap();
  });

  it('should logout user', async () => {
    await element(by.text('Logout')).tap();
    
    // Should show confirmation
    await expect(element(by.text('Are you sure you want to logout?'))).toBeVisible();
    await element(by.text('Confirm')).tap();
    
    // Should navigate to login screen
    await waitFor(element(by.id(testIDs.auth.loginButton)))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should handle delete account flow', async () => {
    // Re-login after logout test
    await actions.login('test@example.com', 'password123');
    await actions.navigateToProfile();
    await element(by.id(testIDs.profile.settingsButton)).tap();
    
    await element(by.text('Account')).tap();
    await element(by.text('Delete Account')).tap();
    
    // Should show warning
    await expect(element(by.text('Delete Account'))).toBeVisible();
    await expect(element(by.text('This action cannot be undone'))).toBeVisible();
    await expect(element(by.id('confirm-delete-input'))).toBeVisible();
    
    // Type confirmation
    await element(by.id('confirm-delete-input')).typeText('DELETE');
    await element(by.text('Delete My Account')).tap();
    
    // Should require password
    await expect(element(by.id('password-confirm-input'))).toBeVisible();
    
    // Cancel for test purposes
    await element(by.text('Cancel')).tap();
  });
});