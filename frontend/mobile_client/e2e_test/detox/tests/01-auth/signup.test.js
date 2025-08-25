const testIDs = require('../../helpers/testIds');
const actions = require('../../helpers/actions');

describe('Signup Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    // Navigate to signup screen
    await element(by.text('Sign Up')).tap();
  });

  it('should show signup screen elements', async () => {
    await expect(element(by.id(testIDs.auth.nameInput))).toBeVisible();
    await expect(element(by.id(testIDs.auth.emailInput))).toBeVisible();
    await expect(element(by.id(testIDs.auth.passwordInput))).toBeVisible();
    await expect(element(by.id(testIDs.auth.confirmPasswordInput))).toBeVisible();
    await expect(element(by.id(testIDs.auth.signupButton))).toBeVisible();
    await expect(element(by.text('Already have an account?'))).toBeVisible();
  });

  it('should show error for empty name', async () => {
    await element(by.id(testIDs.auth.emailInput)).typeText('test@example.com');
    await element(by.id(testIDs.auth.passwordInput)).typeText('password123');
    await element(by.id(testIDs.auth.confirmPasswordInput)).typeText('password123');
    await element(by.id(testIDs.auth.signupButton)).tap();
    
    await expect(element(by.text('Name is required'))).toBeVisible();
  });

  it('should show error for invalid email', async () => {
    await element(by.id(testIDs.auth.nameInput)).typeText('Test User');
    await element(by.id(testIDs.auth.emailInput)).typeText('invalidemail');
    await element(by.id(testIDs.auth.passwordInput)).typeText('password123');
    await element(by.id(testIDs.auth.confirmPasswordInput)).typeText('password123');
    await element(by.id(testIDs.auth.signupButton)).tap();
    
    await expect(element(by.text('Invalid email format'))).toBeVisible();
  });

  it('should show error for weak password', async () => {
    await element(by.id(testIDs.auth.nameInput)).typeText('Test User');
    await element(by.id(testIDs.auth.emailInput)).typeText('test@example.com');
    await element(by.id(testIDs.auth.passwordInput)).typeText('123');
    await element(by.id(testIDs.auth.confirmPasswordInput)).typeText('123');
    await element(by.id(testIDs.auth.signupButton)).tap();
    
    await expect(element(by.text('Password must be at least 8 characters'))).toBeVisible();
  });

  it('should show error for password mismatch', async () => {
    await element(by.id(testIDs.auth.nameInput)).typeText('Test User');
    await element(by.id(testIDs.auth.emailInput)).typeText('test@example.com');
    await element(by.id(testIDs.auth.passwordInput)).typeText('password123');
    await element(by.id(testIDs.auth.confirmPasswordInput)).typeText('password456');
    await element(by.id(testIDs.auth.signupButton)).tap();
    
    await expect(element(by.text('Passwords do not match'))).toBeVisible();
  });

  it('should signup successfully with valid information', async () => {
    const timestamp = Date.now();
    const email = `newuser${timestamp}@example.com`;
    
    await actions.signup('New User', email, 'password123');
    
    // Should navigate to feed after successful signup
    await waitFor(element(by.id(testIDs.feed.feedList)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should show error for existing email', async () => {
    await element(by.id(testIDs.auth.nameInput)).typeText('Test User');
    await element(by.id(testIDs.auth.emailInput)).typeText('existing@example.com');
    await element(by.id(testIDs.auth.passwordInput)).typeText('password123');
    await element(by.id(testIDs.auth.confirmPasswordInput)).typeText('password123');
    await element(by.id(testIDs.auth.signupButton)).tap();
    
    await expect(element(by.text('Email already exists'))).toBeVisible();
  });

  it('should navigate back to login screen', async () => {
    await element(by.text('Already have an account?')).tap();
    await expect(element(by.id(testIDs.auth.loginButton))).toBeVisible();
  });

  it('should clear form on navigation', async () => {
    // Fill form
    await element(by.id(testIDs.auth.nameInput)).typeText('Test User');
    await element(by.id(testIDs.auth.emailInput)).typeText('test@example.com');
    
    // Navigate away and back
    await element(by.text('Already have an account?')).tap();
    await element(by.text('Sign Up')).tap();
    
    // Form should be cleared
    await expect(element(by.id(testIDs.auth.nameInput))).toHaveText('');
    await expect(element(by.id(testIDs.auth.emailInput))).toHaveText('');
  });
});