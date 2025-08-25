const testIDs = require('../../helpers/testIds');
const actions = require('../../helpers/actions');

describe('Profile View', () => {
  beforeAll(async () => {
    await device.reloadReactNative();
    await actions.login('test@example.com', 'password123');
  });

  beforeEach(async () => {
    await actions.navigateToProfile();
  });

  it('should display profile header', async () => {
    await expect(element(by.id(testIDs.profile.header))).toBeVisible();
    await expect(element(by.id(testIDs.profile.avatar))).toBeVisible();
    await expect(element(by.id(testIDs.profile.username))).toBeVisible();
    await expect(element(by.id(testIDs.profile.bio))).toBeVisible();
  });

  it('should display profile stats', async () => {
    await expect(element(by.id(testIDs.profile.stats))).toBeVisible();
    await expect(element(by.id(testIDs.profile.followersCount))).toBeVisible();
    await expect(element(by.id(testIDs.profile.followingCount))).toBeVisible();
    await expect(element(by.id(testIDs.profile.postsCount))).toBeVisible();
  });

  it('should display edit and settings buttons for own profile', async () => {
    await expect(element(by.id(testIDs.profile.editButton))).toBeVisible();
    await expect(element(by.id(testIDs.profile.settingsButton))).toBeVisible();
  });

  it('should display profile tabs', async () => {
    await expect(element(by.id(testIDs.profile.tabSelector))).toBeVisible();
    await expect(element(by.id(testIDs.profile.postsTab))).toBeVisible();
    await expect(element(by.id(testIDs.profile.journeysTab))).toBeVisible();
  });

  it('should switch between profile tabs', async () => {
    // Default should be posts
    await expect(element(by.id(testIDs.profile.postsGrid))).toBeVisible();
    
    // Switch to journeys
    await element(by.id(testIDs.profile.journeysTab)).tap();
    await expect(element(by.id(testIDs.profile.journeyCard('journey-1')))).toBeVisible();
    
    // Switch back to posts
    await element(by.id(testIDs.profile.postsTab)).tap();
    await expect(element(by.id(testIDs.profile.postsGrid))).toBeVisible();
  });

  it('should display user posts in grid', async () => {
    await expect(element(by.id(testIDs.profile.postsGrid))).toBeVisible();
    // Should have at least one post
    await expect(element(by.id(testIDs.profile.postThumbnail(0)))).toBeVisible();
  });

  it('should open post detail from grid', async () => {
    await element(by.id(testIDs.profile.postThumbnail(0))).tap();
    
    // Should open post detail modal/screen
    await expect(element(by.id('post-detail'))).toBeVisible();
    
    // Close detail
    await element(by.id(testIDs.common.modalCloseButton)).tap();
  });

  it('should navigate to followers list', async () => {
    await element(by.id(testIDs.profile.followersCount)).tap();
    
    await expect(element(by.text('Followers'))).toBeVisible();
    await expect(element(by.id('followers-list'))).toBeVisible();
    
    // Navigate back
    await element(by.id(testIDs.common.backButton)).tap();
  });

  it('should navigate to following list', async () => {
    await element(by.id(testIDs.profile.followingCount)).tap();
    
    await expect(element(by.text('Following'))).toBeVisible();
    await expect(element(by.id('following-list'))).toBeVisible();
    
    // Navigate back
    await element(by.id(testIDs.common.backButton)).tap();
  });

  it('should scroll through posts', async () => {
    // Scroll down in posts grid
    await element(by.id(testIDs.profile.postsGrid)).swipe('up');
    
    // More posts should load
    await waitFor(element(by.id(testIDs.profile.postThumbnail(9))))
      .toBeVisible()
      .whileElement(by.id(testIDs.profile.postsGrid))
      .scroll(200, 'down');
  });

  it('should display journeys with progress', async () => {
    await element(by.id(testIDs.profile.journeysTab)).tap();
    
    const journeyId = 'journey-1';
    await expect(element(by.id(testIDs.profile.journeyCard(journeyId)))).toBeVisible();
    
    // Journey should show progress
    await expect(element(by.id(`${journeyId}-progress`))).toBeVisible();
    await expect(element(by.id(`${journeyId}-milestone-count`))).toBeVisible();
  });

  it('should open journey detail', async () => {
    await element(by.id(testIDs.profile.journeysTab)).tap();
    
    await element(by.id(testIDs.profile.journeyCard('journey-1'))).tap();
    
    // Should navigate to journey detail
    await expect(element(by.text('Journey Timeline'))).toBeVisible();
    await expect(element(by.id('journey-milestones'))).toBeVisible();
    
    // Navigate back
    await element(by.id(testIDs.common.backButton)).tap();
  });
});