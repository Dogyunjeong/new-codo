const testIDs = require('./testIds');

/**
 * Common E2E test actions and helpers
 */

const actions = {
  /**
   * Authentication actions
   */
  async login(email, password) {
    await element(by.id(testIDs.auth.emailInput)).typeText(email);
    await element(by.id(testIDs.auth.passwordInput)).typeText(password);
    await element(by.id(testIDs.auth.loginButton)).tap();
    
    // Wait for navigation to complete
    await waitFor(element(by.id(testIDs.feed.feedList)))
      .toBeVisible()
      .withTimeout(5000);
  },

  async signup(name, email, password) {
    await element(by.id(testIDs.auth.nameInput)).typeText(name);
    await element(by.id(testIDs.auth.emailInput)).typeText(email);
    await element(by.id(testIDs.auth.passwordInput)).typeText(password);
    await element(by.id(testIDs.auth.confirmPasswordInput)).typeText(password);
    await element(by.id(testIDs.auth.signupButton)).tap();
  },

  async logout() {
    // Navigate to profile
    await element(by.id(testIDs.navigation.profileTab)).tap();
    // Tap settings
    await element(by.id(testIDs.profile.settingsButton)).tap();
    // Tap logout (assuming there's a logout button in settings)
    await element(by.text('Logout')).tap();
    // Confirm logout
    await element(by.text('Confirm')).tap();
  },

  /**
   * Navigation actions
   */
  async navigateToTab(tabName) {
    const tabId = testIDs.navigation[`${tabName}Tab`];
    await element(by.id(tabId)).tap();
  },

  async navigateToProfile() {
    await element(by.id(testIDs.navigation.profileTab)).tap();
  },

  async navigateToFeed() {
    await element(by.id(testIDs.navigation.homeTab)).tap();
  },

  /**
   * Feed actions
   */
  async refreshFeed() {
    await element(by.id(testIDs.feed.feedList)).swipe('down', 'slow', 0.5);
    // Wait for refresh to complete
    await waitFor(element(by.id(testIDs.feed.refreshControl)))
      .toNotExist()
      .withTimeout(3000);
  },

  async scrollToBottom() {
    await element(by.id(testIDs.feed.feedList)).swipe('up', 'fast', 0.9);
  },

  async likePost(postId) {
    await element(by.id(testIDs.feed.likeButton(postId))).tap();
  },

  async commentOnPost(postId, comment) {
    await element(by.id(testIDs.feed.commentButton(postId))).tap();
    await element(by.id('comment-input')).typeText(comment);
    await element(by.text('Post')).tap();
  },

  /**
   * Post creation actions
   */
  async createPost(title, content, category = null) {
    // Tap create button
    await element(by.id(testIDs.post.createButton)).tap();
    
    // Enter title if provided
    if (title) {
      await element(by.id(testIDs.post.titleInput)).typeText(title);
    }
    
    // Enter content
    await element(by.id(testIDs.post.textInput)).typeText(content);
    
    // Select category if provided
    if (category) {
      await element(by.id(testIDs.post.categorySelector)).tap();
      await element(by.id(testIDs.post.categoryOption(category))).tap();
    }
    
    // Submit post
    await element(by.id(testIDs.post.submitButton)).tap();
    
    // Wait for navigation back to feed
    await waitFor(element(by.id(testIDs.feed.feedList)))
      .toBeVisible()
      .withTimeout(5000);
  },

  /**
   * Utility functions
   */
  async waitForElement(elementId, timeout = 5000) {
    await waitFor(element(by.id(elementId)))
      .toBeVisible()
      .withTimeout(timeout);
  },

  async waitForText(text, timeout = 5000) {
    await waitFor(element(by.text(text)))
      .toBeVisible()
      .withTimeout(timeout);
  },

  async clearAndTypeText(elementId, text) {
    await element(by.id(elementId)).clearText();
    await element(by.id(elementId)).typeText(text);
  },

  async scrollToElement(scrollViewId, targetElementId) {
    await waitFor(element(by.id(targetElementId)))
      .toBeVisible()
      .whileElement(by.id(scrollViewId))
      .scroll(200, 'down');
  },

  async takeScreenshot(name) {
    await device.takeScreenshot(name);
  },

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
};

module.exports = actions;