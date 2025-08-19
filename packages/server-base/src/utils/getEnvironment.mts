import { EnvTypes } from '@base/shared-types';
import 'dotenv/config';

/**
 * Get base environment configuration from BASE_ENV_JSON
 * All backend services should use this to get their environment configuration
 */
const getBaseEnvironment = (): EnvTypes.BaseEnv => {
  const { NODE_ENV, BASE_ENV_JSON } = process.env;
  
  if (!BASE_ENV_JSON) {
    // In development, provide helpful error message
    if (NODE_ENV === 'development' || !NODE_ENV) {
      throw new Error(
        'BASE_ENV_JSON is not defined. ' +
        'Make sure you are running services through Docker with deploy/local/docker-compose.yml ' +
        'or set BASE_ENV_JSON environment variable with JSON stringified configuration.'
      );
    }
    throw new Error('BASE_ENV_JSON is not defined');
  }
  
  try {
    const baseEnv: EnvTypes.BaseEnv = JSON.parse(BASE_ENV_JSON);
    
    // Validate required fields
    if (!baseEnv.SERVICE_NAME) {
      throw new Error('SERVICE_NAME is required in BASE_ENV_JSON');
    }
    if (!baseEnv.HTTP_PORT && baseEnv.HTTP_PORT !== 0) {
      throw new Error('HTTP_PORT is required in BASE_ENV_JSON');
    }
    
    // Set NODE_ENV from parsed config or fallback to process.env
    if (!baseEnv.NODE_ENV && NODE_ENV) {
      baseEnv.NODE_ENV = NODE_ENV as EnvTypes.BaseEnv['NODE_ENV'];
    }
    
    return baseEnv;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse BASE_ENV_JSON: ${error.message}`);
    }
    throw error;
  }
};

/**
 * Get service-specific environment configuration
 * This function provides type-safe access to service-specific environment
 * 
 * @template T - Service name type
 * @param serviceName - Name of the service
 * @returns Typed environment for the specific service
 * 
 * @example
 * ```typescript
 * // In auth service
 * const env = getServiceEnvironment('ziririt-auth-service');
 * // env is typed as AuthServiceEnv
 * console.log(env.HTTP_PORT); // 4101
 * ```
 */
function getServiceEnvironment<T extends keyof EnvTypes.ServiceEnvMap>(
  serviceName: T
): EnvTypes.ServiceEnvMap[T] {
  const baseEnv = getBaseEnvironment();
  
  // Validate service name matches
  if (baseEnv.SERVICE_NAME !== serviceName) {
    console.warn(
      `Service name mismatch: expected ${serviceName}, got ${baseEnv.SERVICE_NAME}. ` +
      `This might indicate incorrect service configuration.`
    );
  }
  
  // Apply service-specific defaults based on service name
  const serviceDefaults = getServiceDefaults(serviceName);
  
  return {
    ...serviceDefaults,
    ...baseEnv,
  } as EnvTypes.ServiceEnvMap[T];
}

/**
 * Get default values for specific services
 */
function getServiceDefaults(serviceName: string): Partial<EnvTypes.BaseEnv> {
  switch (serviceName) {
    case 'ziririt-auth-service':
      return {
        HTTP_PORT: 4101,
        PASSWORD_SALT_ROUNDS: 10,
        SESSION_EXPIRES_IN: '7d',
        JWT_EXPIRES_IN: '15m',
        JWT_REFRESH_EXPIRES_IN: '7d',
      };
    
    case 'ziririt-profile-service':
      return {
        HTTP_PORT: 4102,
        PROFILE_CACHE_TTL: 300,
        MAX_AVATAR_SIZE: 5 * 1024 * 1024, // 5MB
      };
    
    case 'ziririt-post-service':
      return {
        HTTP_PORT: 4103,
        POST_CACHE_TTL: 300,
        MAX_MEDIA_SIZE: 10 * 1024 * 1024, // 10MB
        MEDIA_STORAGE_PATH: '/app/media',
        ALLOWED_MEDIA_TYPES: 'image/jpeg,image/png,image/gif,video/mp4',
      };
    
    case 'ziririt-feed-service':
      return {
        HTTP_PORT: 4104,
        FEED_CACHE_TTL: 300,
        FEED_PAGE_SIZE: 20,
        TRENDING_WINDOW_HOURS: 24,
        RECOMMENDATION_ALGORITHM: 'collaborative_filtering',
      };
    
    case 'ziririt-api-gateway':
      return {
        HTTP_PORT: 4100,
        REQUEST_TIMEOUT: 30000,
        CIRCUIT_BREAKER_THRESHOLD: 5,
        UPSTREAM_RETRY_COUNT: 3,
      };
    
    default:
      return {};
  }
}

/**
 * Helper function to get environment variable with fallback
 */
function getEnvVar(key: string, fallback?: string): string | undefined {
  return process.env[key] || fallback;
}

/**
 * Check if running in production
 */
function isProduction(): boolean {
  const env = getBaseEnvironment();
  return env.NODE_ENV === 'production' || env.APP_ENV === 'prod';
}

/**
 * Check if running in development
 */
function isDevelopment(): boolean {
  const env = getBaseEnvironment();
  return env.NODE_ENV === 'development' || env.APP_ENV === 'local' || env.APP_ENV === 'dev';
}

/**
 * Check if running in test
 */
function isTest(): boolean {
  const env = getBaseEnvironment();
  return env.NODE_ENV === 'test';
}

export { 
  getBaseEnvironment,
  getServiceEnvironment,
  getEnvVar,
  isProduction,
  isDevelopment,
  isTest,
};