/**
 * Centralized test IDs for E2E testing
 * These IDs should be added to components using the testID prop
 */

const testIDs = {
  // Authentication screens
  auth: {
    emailInput: 'auth-email-input',
    passwordInput: 'auth-password-input',
    nameInput: 'auth-name-input',
    confirmPasswordInput: 'auth-confirm-password-input',
    loginButton: 'auth-login-button',
    signupButton: 'auth-signup-button',
    googleButton: 'auth-google-button',
    appleButton: 'auth-apple-button',
    forgotPasswordButton: 'auth-forgot-password-button',
    backButton: 'auth-back-button',
    errorMessage: 'auth-error-message',
    successMessage: 'auth-success-message',
  },

  // Feed screen
  feed: {
    feedList: 'feed-list',
    postCard: (id) => `post-card-${id}`,
    refreshControl: 'feed-refresh',
    tabBar: 'feed-tab-bar',
    tab: (name) => `tab-${name}`,
    storyBar: 'feed-story-bar',
    addStepButton: 'feed-add-step-button',
    likeButton: (postId) => `like-button-${postId}`,
    commentButton: (postId) => `comment-button-${postId}`,
    relateButton: (postId) => `relate-button-${postId}`,
    moreButton: (postId) => `more-button-${postId}`,
    notificationButton: 'feed-notification-button',
    messageButton: 'feed-message-button',
  },

  // Post creation
  post: {
    createButton: 'post-create-button',
    textInput: 'post-text-input',
    titleInput: 'post-title-input',
    categorySelector: 'post-category-selector',
    categoryOption: (name) => `category-${name}`,
    mediaButton: 'post-media-button',
    cameraButton: 'post-camera-button',
    galleryButton: 'post-gallery-button',
    submitButton: 'post-submit-button',
    cancelButton: 'post-cancel-button',
    deleteMediaButton: (index) => `delete-media-${index}`,
  },

  // Profile screen
  profile: {
    header: 'profile-header',
    avatar: 'profile-avatar',
    username: 'profile-username',
    bio: 'profile-bio',
    stats: 'profile-stats',
    followersCount: 'profile-followers-count',
    followingCount: 'profile-following-count',
    postsCount: 'profile-posts-count',
    postsGrid: 'profile-posts-grid',
    postThumbnail: (index) => `profile-post-${index}`,
    followButton: 'profile-follow-button',
    editButton: 'profile-edit-button',
    settingsButton: 'profile-settings-button',
    journeyCard: (id) => `journey-card-${id}`,
    tabSelector: 'profile-tab-selector',
    postsTab: 'profile-posts-tab',
    journeysTab: 'profile-journeys-tab',
  },

  // Navigation
  navigation: {
    homeTab: 'nav-home-tab',
    discoverTab: 'nav-discover-tab',
    createTab: 'nav-create-tab',
    journeyTab: 'nav-journey-tab',
    profileTab: 'nav-profile-tab',
  },

  // Common elements
  common: {
    loadingIndicator: 'loading-indicator',
    errorView: 'error-view',
    retryButton: 'retry-button',
    emptyState: 'empty-state',
    modalOverlay: 'modal-overlay',
    modalCloseButton: 'modal-close-button',
  },
};

module.exports = testIDs;