import { getBaseEnvironment } from '@base/server-base';

const env = getBaseEnvironment();

const appConfig = {
  port: parseInt(process.env.PORT || String(env.HTTP_PORT) || '4100', 10),
  hostUrl: env.HOST_URL || '0.0.0.0',
  serviceName: process.env.SERVICE_NAME || 'ziririt-mono-service',
  nodeEnv: env.NODE_ENV || 'development',

  // Database URLs (for health checks)
  databaseUrl: env.DATABASE_URL || 'postgresql://ziririt_user:ziririt_password@localhost:5432/ziririt_db',
  mongodbUrl: env.MONGODB_URL || 'mongodb://ziririt_user:ziririt_password@localhost:27017/ziririt_posts?authSource=admin',
  redisUrl: env.REDIS_URL || 'redis://localhost:6379',

  // Media
  mediaStoragePath: env.MEDIA_STORAGE_PATH || '/app/media',
  maxFileSize: env.MAX_MEDIA_SIZE || 10485760, // 10MB
};

export default appConfig;
