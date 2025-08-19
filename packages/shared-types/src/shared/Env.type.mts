/**
 * Base environment configuration for all backend services
 * This is parsed from BASE_ENV_JSON environment variable
 */
export interface BaseEnv {
  // Core Configuration
  NODE_ENV: 'development' | 'staging' | 'production' | 'test';
  APP_ENV: 'local' | 'dev' | 'staging' | 'prod';
  HOST_URL: string;
  HTTP_PORT: number;
  SERVICE_NAME: string;
  
  // API Gateway
  API_GATEWAY_URL: string;
  
  // Service URLs (for inter-service communication)
  AUTH_SERVICE_URL: string;
  PROFILE_SERVICE_URL: string;
  POST_SERVICE_URL: string;
  FEED_SERVICE_URL: string;
  
  // PostgreSQL Configuration
  DATABASE_URL: string;
  POSTGRES_DB: string;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  
  // MongoDB Configuration
  MONGODB_URL: string;
  MONGODB_DB: string;
  MONGODB_USER: string;
  MONGODB_PASSWORD: string;
  
  // Redis Configuration
  REDIS_URL: string;
  REDIS_PASSWORD: string;
  
  // JWT Configuration
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  JWT_ID_TOKEN_SIGNING_KEY: string;
  JWT_PRIVATE_KEY: string;
  
  // GCP Configuration
  GCP_PROJECT_ID: string;
  GCP_TASK_QUEUE_PROJECT_ID: string;
  GCP_TASK_QUEUE_LOCATION: string;
  
  // Firebase Configuration (for GCP Identity Platform)
  FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY: string;
  
  // OAuth Configuration
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  APPLE_CLIENT_ID?: string;
  APPLE_TEAM_ID?: string;
  APPLE_PRIVATE_KEY_ID?: string;
  APPLE_PRIVATE_KEY?: string;
  
  // Logging Configuration
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  LOG_FORMAT: 'json' | 'text';
  
  // CORS Configuration
  CORS_ORIGIN: string;
  CORS_CREDENTIALS: boolean;
  
  // Rate Limiting
  RATE_LIMIT_ENABLED: boolean;
  RATE_LIMIT_MAX: number;
  RATE_LIMIT_WINDOW_MS: number;
  
  // Service Discovery
  SERVICE_DISCOVERY_ENABLED: boolean;
}

/**
 * Auth Service specific environment
 */
export interface AuthServiceEnv extends BaseEnv {
  SERVICE_NAME: 'ziririt-auth-service';
  HTTP_PORT: 4101;
  // Auth-specific configurations
  SESSION_SECRET?: string;
  SESSION_EXPIRES_IN?: string;
  PASSWORD_SALT_ROUNDS?: number;
  EMAIL_VERIFICATION_ENABLED?: boolean;
  TWO_FACTOR_AUTH_ENABLED?: boolean;
  MOCK_AUTH_ENABLED?: boolean;
}

/**
 * Profile Service specific environment
 */
export interface ProfileServiceEnv extends BaseEnv {
  SERVICE_NAME: 'ziririt-profile-service';
  HTTP_PORT: 4102;
  // Profile-specific configurations
  AVATAR_UPLOAD_ENABLED?: boolean;
  MAX_AVATAR_SIZE?: number;
  PROFILE_CACHE_TTL?: number;
}

/**
 * Post Service specific environment
 */
export interface PostServiceEnv extends BaseEnv {
  SERVICE_NAME: 'ziririt-post-service';
  HTTP_PORT: 4103;
  // Post-specific configurations
  MEDIA_STORAGE_PATH?: string;
  MAX_MEDIA_SIZE?: number;
  ALLOWED_MEDIA_TYPES?: string;
  POST_CACHE_TTL?: number;
}

/**
 * Feed Service specific environment
 */
export interface FeedServiceEnv extends BaseEnv {
  SERVICE_NAME: 'ziririt-feed-service';
  HTTP_PORT: 4104;
  // Feed-specific configurations
  FEED_CACHE_TTL?: number;
  FEED_PAGE_SIZE?: number;
  RECOMMENDATION_ALGORITHM?: string;
  TRENDING_WINDOW_HOURS?: number;
}

/**
 * API Gateway specific environment
 */
export interface ApiGatewayEnv extends BaseEnv {
  SERVICE_NAME: 'ziririt-api-gateway';
  HTTP_PORT: 4100;
  // Gateway-specific configurations
  REQUEST_TIMEOUT?: number;
  CIRCUIT_BREAKER_ENABLED?: boolean;
  CIRCUIT_BREAKER_THRESHOLD?: number;
  UPSTREAM_RETRY_COUNT?: number;
}

/**
 * Service environment type map
 */
export type ServiceEnvMap = {
  'ziririt-auth-service': AuthServiceEnv;
  'ziririt-profile-service': ProfileServiceEnv;
  'ziririt-post-service': PostServiceEnv;
  'ziririt-feed-service': FeedServiceEnv;
  'ziririt-api-gateway': ApiGatewayEnv;
};

/**
 * Helper type to get environment by service name
 */
export type ServiceEnv<T extends keyof ServiceEnvMap> = ServiceEnvMap[T];

/**
 * Type guard to check if environment is for a specific service
 */
export function isServiceEnv<T extends keyof ServiceEnvMap>(
  env: BaseEnv,
  serviceName: T
): env is ServiceEnvMap[T] {
  return env.SERVICE_NAME === serviceName;
}

/**
 * Legacy BaseEnv export for backward compatibility
 * @deprecated Use BaseEnv instead
 */
export type BaseEnvironment = BaseEnv;