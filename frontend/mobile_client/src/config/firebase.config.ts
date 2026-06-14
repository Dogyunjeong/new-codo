import Constants from 'expo-constants';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface OAuthConfig {
  googleWebClientId: string;
  googleIosClientId: string;
  googleAndroidClientId: string;
  appleServiceId: string;
}

export interface BackendConfig {
  /**
   * The single API gateway URL - all service calls go through this
   */
  apiGatewayUrl: string;

  /**
   * @deprecated Use apiGatewayUrl instead. Kept for backward compatibility.
   */
  authServiceUrl: string;
  /**
   * @deprecated Use apiGatewayUrl instead. Kept for backward compatibility.
   */
  profileServiceUrl: string;
  /**
   * @deprecated Use apiGatewayUrl instead. Kept for backward compatibility.
   */
  postServiceUrl: string;
  /**
   * @deprecated Use apiGatewayUrl instead. Kept for backward compatibility.
   */
  feedServiceUrl: string;
}

export interface FeatureFlags {
  enableGoogleLogin: boolean;
  enableAppleLogin: boolean;
  enableEmailLogin: boolean;
  enableBiometricAuth: boolean;
  enableAnalytics: boolean;
}

export interface AppSettings {
  appName: string;
  appVersion: string;
  apiTimeout: number;
  maxRetryAttempts: number;
  debugMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface AppConfig {
  firebase: FirebaseConfig;
  oauth: OAuthConfig;
  backend: BackendConfig;
  features: FeatureFlags;
  settings: AppSettings;
}

/**
 * Get Firebase configuration based on the current environment
 */
export const getFirebaseConfig = (): FirebaseConfig => {
  const config = Constants.expoConfig?.extra || {};

  return {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || config.firebaseApiKey || '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || config.firebaseAuthDomain || '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || config.firebaseProjectId || '',
    storageBucket:
      process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || config.firebaseStorageBucket || '',
    messagingSenderId:
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || config.firebaseMessagingSenderId || '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || config.firebaseAppId || '',
    measurementId:
      process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || config.firebaseMeasurementId,
  };
};

/**
 * Get OAuth configuration for social logins
 */
export const getOAuthConfig = (): OAuthConfig => {
  const config = Constants.expoConfig?.extra || {};

  return {
    googleWebClientId:
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || config.googleWebClientId || '',
    googleIosClientId:
      process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || config.googleIosClientId || '',
    googleAndroidClientId:
      process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || config.googleAndroidClientId || '',
    appleServiceId: process.env.EXPO_PUBLIC_APPLE_SERVICE_ID || config.appleServiceId || '',
  };
};

/**
 * Get backend service URLs
 *
 * The frontend should only communicate with the API gateway.
 * The gateway routes requests to appropriate microservices:
 * - /api/auth/* → Auth Service
 * - /api/profiles/* → Profile Service
 * - /api/journeys/* → Profile Service
 * - /api/posts/* → Post Service
 * - /api/media/* → Post Service
 * - /api/feed/* → Feed Service
 */
export const getBackendConfig = (): BackendConfig => {
  const config = Constants.expoConfig?.extra || {};

  // Primary: Use API gateway URL (recommended)
  // For Android emulator: 10.0.2.2 maps to host machine's localhost
  // For iOS simulator: localhost works directly
  const defaultGatewayUrl = 'http://10.0.2.2:8080';
  const apiGatewayUrl =
    process.env.EXPO_PUBLIC_API_GATEWAY_URL || config.apiGatewayUrl || defaultGatewayUrl;

  return {
    apiGatewayUrl,
    // All services use the same gateway URL - the gateway handles routing
    authServiceUrl: apiGatewayUrl,
    profileServiceUrl: apiGatewayUrl,
    postServiceUrl: apiGatewayUrl,
    feedServiceUrl: apiGatewayUrl,
  };
};

/**
 * Get feature flags
 */
export const getFeatureFlags = (): FeatureFlags => {
  const config = Constants.expoConfig?.extra || {};

  return {
    enableGoogleLogin:
      process.env.EXPO_PUBLIC_ENABLE_GOOGLE_LOGIN === 'true' || config.enableGoogleLogin || false,
    enableAppleLogin:
      process.env.EXPO_PUBLIC_ENABLE_APPLE_LOGIN === 'true' || config.enableAppleLogin || false,
    enableEmailLogin:
      process.env.EXPO_PUBLIC_ENABLE_EMAIL_LOGIN === 'true' || config.enableEmailLogin || true,
    enableBiometricAuth:
      process.env.EXPO_PUBLIC_ENABLE_BIOMETRIC_AUTH === 'true' ||
      config.enableBiometricAuth ||
      false,
    enableAnalytics:
      process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true' || config.enableAnalytics || false,
  };
};

/**
 * Get app settings
 */
export const getAppSettings = (): AppSettings => {
  const config = Constants.expoConfig?.extra || {};

  return {
    appName: process.env.EXPO_PUBLIC_APP_NAME || config.appName || 'Ziririt',
    appVersion: process.env.EXPO_PUBLIC_APP_VERSION || config.appVersion || '1.0.0',
    apiTimeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || config.apiTimeout || '30000', 10),
    maxRetryAttempts: parseInt(
      process.env.EXPO_PUBLIC_MAX_RETRY_ATTEMPTS || config.maxRetryAttempts || '3',
      10
    ),
    debugMode: process.env.EXPO_PUBLIC_DEBUG_MODE === 'true' || config.debugMode || __DEV__,
    logLevel: (process.env.EXPO_PUBLIC_LOG_LEVEL ||
      config.logLevel ||
      'info') as AppSettings['logLevel'],
  };
};

/**
 * Get complete app configuration
 */
export const getAppConfig = (): AppConfig => {
  return {
    firebase: getFirebaseConfig(),
    oauth: getOAuthConfig(),
    backend: getBackendConfig(),
    features: getFeatureFlags(),
    settings: getAppSettings(),
  };
};

/**
 * Validate configuration
 */
export const validateConfig = (config: AppConfig): boolean => {
  const requiredFields = [
    config.firebase.apiKey,
    config.firebase.authDomain,
    config.firebase.projectId,
    config.backend.apiGatewayUrl,
  ];

  const missingFields = requiredFields.filter((field) => !field);

  if (missingFields.length > 0) {
    console.error('Missing required configuration fields:', missingFields);
    return false;
  }

  return true;
};

/**
 * Get environment name
 */
export const getEnvironment = (): 'development' | 'staging' | 'production' => {
  const env = Constants.expoConfig?.extra?.environment;

  if (env === 'production') return 'production';
  if (env === 'staging') return 'staging';

  return __DEV__ ? 'development' : 'production';
};

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => {
  return getEnvironment() === 'development';
};

/**
 * Check if running in staging mode
 */
export const isStaging = (): boolean => {
  return getEnvironment() === 'staging';
};

/**
 * Check if running in production mode
 */
export const isProduction = (): boolean => {
  return getEnvironment() === 'production';
};

// Export the default configuration
const appConfig = getAppConfig();

// Validate configuration in development
if (__DEV__ && !validateConfig(appConfig)) {
  console.warn('App configuration validation failed. Some features may not work correctly.');
}

export default appConfig;
