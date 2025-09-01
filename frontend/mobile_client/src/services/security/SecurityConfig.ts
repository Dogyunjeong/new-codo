/**
 * Security Configuration for Authentication
 */

export const SecurityConfig = {
  // Token Configuration
  token: {
    refreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
    maxRetries: 3,
    retryDelay: 1000, // 1 second
  },

  // Session Configuration
  session: {
    maxInactivity: 30 * 60 * 1000, // 30 minutes
    backgroundRefresh: true,
    persistSession: true,
  },

  // Biometric Configuration  
  biometric: {
    enabled: true,
    fallbackToPasscode: true,
    maxAttempts: 3,
    lockoutDuration: 5 * 60 * 1000, // 5 minutes
  },

  // Network Security
  network: {
    certificatePinning: false, // Enable in production
    requestTimeout: 30000, // 30 seconds
    retryOnNetworkError: true,
  },

  // OAuth Configuration
  oauth: {
    pkce: true,
    stateLength: 32,
    nonceLength: 32,
    codeVerifierLength: 128,
  },

  // Storage Security
  storage: {
    encryptionEnabled: true,
    keyDerivationIterations: 10000,
    keychainAccessLevel: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
  },

  // Password Policy
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: false,
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
  },

  // Rate Limiting
  rateLimiting: {
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    resetPeriod: 60 * 60 * 1000, // 1 hour
  },

  // Security Headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  },

  // Development Overrides
  development: {
    skipCertificatePinning: true,
    allowInsecureConnections: true,
    verboseLogging: true,
  },
};

/**
 * Get security configuration based on environment
 */
export function getSecurityConfig() {
  const isDevelopment = __DEV__;
  
  if (isDevelopment) {
    return {
      ...SecurityConfig,
      network: {
        ...SecurityConfig.network,
        certificatePinning: false,
      },
      development: {
        ...SecurityConfig.development,
      },
    };
  }
  
  return SecurityConfig;
}
