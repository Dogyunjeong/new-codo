const testIDs = require('../helpers/testIds');
const actions = require('../helpers/actions');

describe('Smoke Test', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should launch the app', async () => {
    // Simple check that the app launches
    await expect(element(by.text('Ziririt'))).toBeVisible();
  });

  it('should show login screen', async () => {
    // Check that auth elements are visible
    await expect(element(by.id(testIDs.auth.emailInput))).toBeVisible();
    await expect(element(by.id(testIDs.auth.passwordInput))).toBeVisible();
    await expect(element(by.id(testIDs.auth.loginButton))).toBeVisible();
  });

  it('should navigate to signup screen', async () => {
    // Check navigation to signup
    await element(by.text('Sign Up')).tap();
    await expect(element(by.id(testIDs.auth.nameInput))).toBeVisible();
    await expect(element(by.id(testIDs.auth.confirmPasswordInput))).toBeVisible();
  });

  it('should handle mock authentication', async () => {
    // Test mock auth login
    await actions.login('test@example.com', 'password123');
    
    // Should navigate to feed after login
    await expect(element(by.id(testIDs.feed.feedList))).toBeVisible();
    await expect(element(by.id(testIDs.navigation.homeTab))).toBeVisible();
  });

  it('should have bottom navigation tabs', async () => {
    // Ensure we're logged in
    await actions.login('test@example.com', 'password123');
    
    // Check all navigation tabs are present
    await expect(element(by.id(testIDs.navigation.homeTab))).toBeVisible();
    await expect(element(by.id(testIDs.navigation.discoverTab))).toBeVisible();
    await expect(element(by.id(testIDs.navigation.createTab))).toBeVisible();
    await expect(element(by.id(testIDs.navigation.journeyTab))).toBeVisible();
    await expect(element(by.id(testIDs.navigation.profileTab))).toBeVisible();
  });
});