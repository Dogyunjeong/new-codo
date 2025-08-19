import { getServiceEnvironment } from '@base/server-base';
import { EnvTypes } from '@base/shared-types';

export interface AppConfig {
  serviceName: string;
  port: number;
  hostUrl: string;
  databaseUrl: string;
  nodeEnv: string;
  
  // Profile-specific configurations
  avatarUploadEnabled?: boolean;
  maxAvatarSize?: number;
  profileCacheTtl?: number;
}

export const getAppConfig = (): AppConfig => {
  // Get environment configuration from BASE_ENV_JSON
  const env = getServiceEnvironment('ziririt-profile-service') as EnvTypes.ProfileServiceEnv;
  
  return {
    serviceName: process.env.SERVICE_NAME || env.SERVICE_NAME || 'ziririt-profile-service',
    port: parseInt(process.env.PORT || String(env.HTTP_PORT) || '4102', 10),
    hostUrl: env.HOST_URL || 'localhost',
    databaseUrl: env.DATABASE_URL || 'postgresql://ziririt_user:ziririt_password@localhost:5432/ziririt_db',
    nodeEnv: env.NODE_ENV || 'development',
    
    // Profile-specific configurations
    avatarUploadEnabled: env.AVATAR_UPLOAD_ENABLED,
    maxAvatarSize: env.MAX_AVATAR_SIZE,
    profileCacheTtl: env.PROFILE_CACHE_TTL,
  };
};