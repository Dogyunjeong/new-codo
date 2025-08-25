const testIDs = require('../../helpers/testIds');
const actions = require('../../helpers/actions');

describe('Feed Navigation', () => {
  beforeAll(async () => {
    await device.reloadReactNative();
    await actions.login('test@example.com', 'password123');
  });

  beforeEach(async () => {
    // Ensure we're on the feed screen
    await actions.navigateToFeed();
  });

  it('should show feed tabs', async () => {
    await expect(element(by.id(testIDs.feed.tabBar))).toBeVisible();
    await expect(element(by.id(testIDs.feed.tab('following')))).toBeVisible();
    await expect(element(by.id(testIDs.feed.tab('trending')))).toBeVisible();
    await expect(element(by.id(testIDs.feed.tab('discover')))).toBeVisible();
  });

  it('should switch between feed tabs', async () => {
    // Switch to trending
    await element(by.id(testIDs.feed.tab('trending'))).tap();
    await expect(element(by.text('Trending Steps'))).toBeVisible();
    
    // Switch to discover
    await element(by.id(testIDs.feed.tab('discover'))).tap();
    await expect(element(by.text('Discover New Journeys'))).toBeVisible();
    
    // Switch back to following
    await element(by.id(testIDs.feed.tab('following'))).tap();
    await expect(element(by.text('Following'))).toBeVisible();
  });

  it('should show story bar', async () => {
    await expect(element(by.id(testIDs.feed.storyBar))).toBeVisible();
    await expect(element(by.id(testIDs.feed.addStepButton))).toBeVisible();
  });

  it('should scroll through stories horizontally', async () => {
    await element(by.id(testIDs.feed.storyBar)).swipe('left');
    // Stories should be scrollable
    await element(by.id(testIDs.feed.storyBar)).swipe('right');
  });

  it('should open add step modal from story bar', async () => {
    await element(by.id(testIDs.feed.addStepButton)).tap();
    await expect(element(by.id(testIDs.post.textInput))).toBeVisible();
    
    // Close modal
    await element(by.id(testIDs.post.cancelButton)).tap();
  });

  it('should navigate to notifications', async () => {
    await element(by.id(testIDs.feed.notificationButton)).tap();
    await expect(element(by.text('Notifications'))).toBeVisible();
    
    // Navigate back
    await element(by.id(testIDs.common.backButton)).tap();
  });

  it('should navigate to messages', async () => {
    await element(by.id(testIDs.feed.messageButton)).tap();
    await expect(element(by.text('Messages'))).toBeVisible();
    
    // Navigate back
    await element(by.id(testIDs.common.backButton)).tap();
  });
});