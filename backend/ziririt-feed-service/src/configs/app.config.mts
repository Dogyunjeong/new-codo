const appConfig = {
  HTTP_PORT: parseInt(process.env.PORT || '4104', 10),
  HOST_URL: process.env.HOST_URL || '0.0.0.0',
  SERVICE_NAME: process.env.SERVICE_NAME || 'ziririt-feed-service',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://ziririt_user:ziririt_password@mongodb:27017/ziririt_posts?authSource=admin',
  REDIS_URL: process.env.REDIS_URL || 'redis://:ziririt_password@redis:6379',
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://ziririt-auth-service:4101',
  PROFILE_SERVICE_URL: process.env.PROFILE_SERVICE_URL || 'http://ziririt-profile-service:4102',
  POST_SERVICE_URL: process.env.POST_SERVICE_URL || 'http://ziririt-post-service:4103',
};

export default appConfig;