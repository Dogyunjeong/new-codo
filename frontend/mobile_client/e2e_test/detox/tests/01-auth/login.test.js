const testIDs = require('../../helpers/testIds');
const actions = require('../../helpers/actions');

describe('Login Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show login screen elements', async () => {
    await expect(element(by.id(testIDs.auth.emailInput))).toBeVisible();
    await expect(element(by.id(testIDs.auth.passwordInput))).toBeVisible();
    await expect(element(by.id(testIDs.auth.loginButton))).toBeVisible();
    await expect(element(by.id(testIDs.auth.googleButton))).toBeVisible();
    await expect(element(by.id(testIDs.auth.appleButton))).toBeVisible();
    await expect(element(by.text('Sign Up'))).toBeVisible();
    await expect(element(by.id(testIDs.auth.forgotPasswordButton))).toBeVisible();
  });

  it('should show error for empty email', async () => {
    await element(by.id(testIDs.auth.loginButton)).tap();
    await expect(element(by.text('Email is required'))).toBeVisible();
  });

  it('should show error for invalid email format', async () => {
    await element(by.id(testIDs.auth.emailInput)).typeText('invalidemail');
    await element(by.id(testIDs.auth.passwordInput)).typeText('password123');
    await element(by.id(testIDs.auth.loginButton)).tap();
    await expect(element(by.text('Invalid email format'))).toBeVisible();
  });

  it('should show error for empty password', async () => {
    await element(by.id(testIDs.auth.emailInput)).typeText('test@example.com');
    await element(by.id(testIDs.auth.loginButton)).tap();
    await expect(element(by.text('Password is required'))).toBeVisible();
  });

  it('should login successfully with valid credentials', async () => {
    await actions.login('test@example.com', 'password123');
    
    // Should navigate to feed
    await expect(element(by.id(testIDs.feed.feedList))).toBeVisible();
    await expect(element(by.id(testIDs.navigation.homeTab))).toBeVisible();
  });

  it('should show error for incorrect credentials', async () => {
    await element(by.id(testIDs.auth.emailInput)).typeText('wrong@example.com');
    await element(by.id(testIDs.auth.passwordInput)).typeText('wrongpassword');
    await element(by.id(testIDs.auth.loginButton)).tap();
    
    await expect(element(by.text('Invalid credentials'))).toBeVisible();
  });

  it('should navigate to forgot password screen', async () => {
    await element(by.id(testIDs.auth.forgotPasswordButton)).tap();
    await expect(element(by.text('Reset Password'))).toBeVisible();
    await expect(element(by.text('Enter your email to reset password'))).toBeVisible();
  });

  it('should navigate to signup screen', async () => {
    await element(by.text('Sign Up')).tap();
    await expect(element(by.id(testIDs.auth.nameInput))).toBeVisible();
    await expect(element(by.id(testIDs.auth.signupButton))).toBeVisible();
  });

  it('should handle Google sign in', async () => {
    await element(by.id(testIDs.auth.googleButton)).tap();
    
    // Mock Google auth will auto-complete
    await waitFor(element(by.id(testIDs.feed.feedList)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should handle Apple sign in on iOS', async () => {
    if (device.getPlatform() === 'ios') {
      await element(by.id(testIDs.auth.appleButton)).tap();
      
      // Mock Apple auth will auto-complete
      await waitFor(element(by.id(testIDs.feed.feedList)))
        .toBeVisible()
        .withTimeout(5000);
    }
  });

  it('should persist login state', async () => {
    // Login first
    await actions.login('test@example.com', 'password123');
    await expect(element(by.id(testIDs.feed.feedList))).toBeVisible();
    
    // Reload app
    await device.reloadReactNative();
    
    // Should still be logged in
    await expect(element(by.id(testIDs.feed.feedList))).toBeVisible();
  });
});