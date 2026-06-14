import { getServiceEnvironment } from '@base/server-base';
import { EnvTypes } from '@base/shared-types';

export interface AppConfig {
  serviceName: string;
  port: number;
  hostUrl: string;
  databaseUrl: string;
  authServiceUrl: string;
  mediaStoragePath: string;
  maxFileSize: number;
  allowedImageTypes: string[];
  allowedVideoTypes: string[];
  nodeEnv: string;
  
  // Post-specific configurations
  postCacheTtl?: number;
}

export const getAppConfig = (): AppConfig => {
  // Get environment configuration from BASE_ENV_JSON
  const env = getServiceEnvironment('ziririt-post-service') as EnvTypes.PostServiceEnv;
  
  // Parse allowed media types
  const allowedMediaTypes = (env.ALLOWED_MEDIA_TYPES || 'image/jpeg,image/png,image/gif,video/mp4').split(',');
  const allowedImageTypes = allowedMediaTypes.filter(type => type.startsWith('image/'));
  const allowedVideoTypes = allowedMediaTypes.filter(type => type.startsWith('video/'));
  
  return {
    serviceName: process.env.SERVICE_NAME || env.SERVICE_NAME || 'ziririt-post-service',
    port: parseInt(process.env.PORT || String(env.HTTP_PORT) || '4103', 10),
    hostUrl: env.HOST_URL || 'localhost',
    databaseUrl: env.MONGODB_URL || 'mongodb://ziririt_user:ziririt_password@localhost:27017/ziririt_posts?authSource=admin',
    authServiceUrl: env.AUTH_SERVICE_URL || 'http://ziririt-auth-service:4101',
    mediaStoragePath: env.MEDIA_STORAGE_PATH || './media',
    maxFileSize: env.MAX_MEDIA_SIZE || 10485760, // 10MB default
    allowedImageTypes: allowedImageTypes.length > 0 ? allowedImageTypes : ['image/jpeg', 'image/png', 'image/webp'],
    allowedVideoTypes: allowedVideoTypes.length > 0 ? allowedVideoTypes : ['video/mp4', 'video/quicktime'],
    nodeEnv: env.NODE_ENV || 'development',
    
    // Post-specific configurations
    postCacheTtl: env.POST_CACHE_TTL,
  };
};
