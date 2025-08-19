import { getServiceEnvironment } from '@base/server-base';
import { FeedServiceEnv } from '@base/shared-types';

// Get environment configuration from BASE_ENV_JSON
const env = getServiceEnvironment('ziririt-feed-service') as FeedServiceEnv;

const appConfig = {
  HTTP_PORT: env.HTTP_PORT || parseInt(process.env.PORT || '4104', 10),
  HOST_URL: env.HOST_URL || '0.0.0.0',
  SERVICE_NAME: env.SERVICE_NAME || 'ziririt-feed-service',
  MONGODB_URI: env.MONGODB_URL || 'mongodb://ziririt_user:ziririt_password@mongodb:27017/ziririt_posts?authSource=admin',
  REDIS_URL: env.REDIS_URL || 'redis://:ziririt_password@redis:6379',
  AUTH_SERVICE_URL: env.AUTH_SERVICE_URL || 'http://ziririt-auth-service:4101',
  PROFILE_SERVICE_URL: env.PROFILE_SERVICE_URL || 'http://ziririt-profile-service:4102',
  POST_SERVICE_URL: env.POST_SERVICE_URL || 'http://ziririt-post-service:4103',
  
  // Feed-specific configurations
  FEED_CACHE_TTL: env.FEED_CACHE_TTL || 300,
  FEED_PAGE_SIZE: env.FEED_PAGE_SIZE || 20,
  RECOMMENDATION_ALGORITHM: env.RECOMMENDATION_ALGORITHM || 'collaborative_filtering',
  TRENDING_WINDOW_HOURS: env.TRENDING_WINDOW_HOURS || 24,
};

export default appConfig;