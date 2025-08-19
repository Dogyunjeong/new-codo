import appConfig, { 
  AppConfig, 
  getEnvironment, 
  isDevelopment, 
  isStaging, 
  isProduction,
  validateConfig 
} from './firebase.config';

/**
 * Main app configuration export
 * This file serves as the central configuration point for the entire application
 */

// Re-export the configuration from firebase.config.ts
export { 
  AppConfig,
  FirebaseConfig,
  OAuthConfig,
  BackendConfig,
  FeatureFlags,
  AppSettings,
  getFirebaseConfig,
  getOAuthConfig,
  getBackendConfig,
  getFeatureFlags,
  getAppSettings,
  getAppConfig,
  validateConfig,
  getEnvironment,
  isDevelopment,
  isStaging,
  isProduction
} from './firebase.config';

// Export the default configuration
export default appConfig;

/**
 * Additional app-specific configurations
 */

// API Headers
export const getDefaultHeaders = () => ({
  'Content-Type': 'application/json',
  'X-App-Version': appConfig.settings.appVersion,
  'X-App-Platform': 'mobile',
  'X-App-Environment': getEnvironment(),
});

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@ziririt:auth_token',
  REFRESH_TOKEN: '@ziririt:refresh_token',
  USER_DATA: '@ziririt:user_data',
  DEVICE_ID: '@ziririt:device_id',
  ONBOARDING_COMPLETED: '@ziririt:onboarding_completed',
  THEME_PREFERENCE: '@ziririt:theme_preference',
  LANGUAGE_PREFERENCE: '@ziririt:language_preference',
  NOTIFICATION_SETTINGS: '@ziririt:notification_settings',
  CACHED_FEED: '@ziririt:cached_feed',
  DRAFT_POSTS: '@ziririt:draft_posts',
} as const;

// Navigation Routes
export const ROUTES = {
  // Auth Stack
  AUTH: {
    LOGIN: 'Login',
    SIGNUP: 'Signup',
    FORGOT_PASSWORD: 'ForgotPassword',
    RESET_PASSWORD: 'ResetPassword',
    VERIFY_EMAIL: 'VerifyEmail',
    ONBOARDING: 'Onboarding',
  },
  // Main Tab Navigator
  MAIN: {
    FEED: 'Feed',
    DISCOVER: 'Discover',
    CREATE: 'Create',
    JOURNEY: 'Journey',
    PROFILE: 'Profile',
  },
  // Modal Screens
  MODAL: {
    CREATE_STEP: 'CreateStep',
    CREATE_JOURNEY: 'CreateJourney',
    EDIT_PROFILE: 'EditProfile',
    SETTINGS: 'Settings',
    NOTIFICATIONS: 'Notifications',
  },
  // Detail Screens
  DETAIL: {
    POST: 'PostDetail',
    JOURNEY: 'JourneyDetail',
    USER_PROFILE: 'UserProfile',
    FOLLOWERS: 'Followers',
    FOLLOWING: 'Following',
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  AUTH_FAILED: 'Authentication failed. Please try again.',
  TOKEN_EXPIRED: 'Your session has expired. Please login again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  USER_NOT_FOUND: 'User not found.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  WEAK_PASSWORD: 'Password must be at least 8 characters long.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  RATE_LIMITED: 'Too many requests. Please try again later.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  SIGNUP_SUCCESS: 'Account created successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  PASSWORD_RESET_SENT: 'Password reset link sent to your email.',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  POST_CREATED: 'Post created successfully.',
  POST_DELETED: 'Post deleted successfully.',
  FOLLOWING_USER: 'You are now following this user.',
  UNFOLLOWED_USER: 'You have unfollowed this user.',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  USERNAME_REGEX: /^[a-zA-Z0-9_]+$/,
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 50,
  BIO_MAX_LENGTH: 150,
  POST_MAX_LENGTH: 500,
  COMMENT_MAX_LENGTH: 200,
} as const;

// Image Configuration
export const IMAGE_CONFIG = {
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  THUMBNAIL_SIZE: { width: 150, height: 150 },
  PREVIEW_SIZE: { width: 600, height: 600 },
  FULL_SIZE: { width: 1200, height: 1200 },
  QUALITY: 0.8,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  FEED_PAGE_SIZE: 10,
  COMMENTS_PAGE_SIZE: 20,
  FOLLOWERS_PAGE_SIZE: 30,
  SEARCH_PAGE_SIZE: 20,
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  FEED_CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  USER_CACHE_DURATION: 10 * 60 * 1000, // 10 minutes
  POST_CACHE_DURATION: 30 * 60 * 1000, // 30 minutes
  IMAGE_CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// Animation Configuration
export const ANIMATION_CONFIG = {
  DURATION: {
    SHORT: 200,
    MEDIUM: 300,
    LONG: 500,
  },
  EASING: {
    IN: 'ease-in',
    OUT: 'ease-out',
    IN_OUT: 'ease-in-out',
  },
} as const;

// Social Media Links (for sharing)
export const SOCIAL_LINKS = {
  WEBSITE: 'https://ziririt.com',
  INSTAGRAM: 'https://instagram.com/ziririt',
  TWITTER: 'https://twitter.com/ziririt',
  FACEBOOK: 'https://facebook.com/ziririt',
  SUPPORT_EMAIL: 'support@ziririt.com',
  PRIVACY_POLICY: 'https://ziririt.com/privacy',
  TERMS_OF_SERVICE: 'https://ziririt.com/terms',
} as const;

// Analytics Events
export const ANALYTICS_EVENTS = {
  // Authentication
  LOGIN_ATTEMPTED: 'login_attempted',
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  SIGNUP_STARTED: 'signup_started',
  SIGNUP_COMPLETED: 'signup_completed',
  LOGOUT: 'logout',
  
  // Content Creation
  POST_CREATED: 'post_created',
  POST_EDITED: 'post_edited',
  POST_DELETED: 'post_deleted',
  JOURNEY_CREATED: 'journey_created',
  
  // Social Interactions
  POST_LIKED: 'post_liked',
  POST_UNLIKED: 'post_unliked',
  COMMENT_ADDED: 'comment_added',
  USER_FOLLOWED: 'user_followed',
  USER_UNFOLLOWED: 'user_unfollowed',
  
  // Navigation
  SCREEN_VIEW: 'screen_view',
  TAB_PRESSED: 'tab_pressed',
  
  // Errors
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
} as const;

/**
 * Get API URL for a specific service
 */
export const getServiceUrl = (service: 'auth' | 'profile' | 'post' | 'feed'): string => {
  const backend = appConfig.backend;
  
  switch (service) {
    case 'auth':
      return backend.authServiceUrl;
    case 'profile':
      return backend.profileServiceUrl;
    case 'post':
      return backend.postServiceUrl;
    case 'feed':
      return backend.feedServiceUrl;
    default:
      throw new Error(`Unknown service: ${service}`);
  }
};

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (feature: keyof typeof appConfig.features): boolean => {
  return appConfig.features[feature] === true;
};

/**
 * Log based on current log level
 */
export const log = (level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: any[]) => {
  const logLevels = { debug: 0, info: 1, warn: 2, error: 3 };
  const currentLevel = logLevels[appConfig.settings.logLevel];
  const messageLevel = logLevels[level];
  
  if (messageLevel >= currentLevel) {
    console[level](message, ...args);
  }
};