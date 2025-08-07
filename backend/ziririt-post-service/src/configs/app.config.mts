import 'dotenv/config';

export interface AppConfig {
  serviceName: string;
  port: number;
  hostUrl: string;
  databaseUrl: string;
  mediaStoragePath: string;
  maxFileSize: number;
  allowedImageTypes: string[];
  allowedVideoTypes: string[];
  nodeEnv: string;
}

export const getAppConfig = (): AppConfig => {
  return {
    serviceName: 'ziririt-post-service',
    port: parseInt(process.env.PORT || '4103', 10),
    hostUrl: process.env.HOST_URL || 'localhost',
    databaseUrl: process.env.MONGODB_URI || 'mongodb://ziririt_user:ziririt_password@localhost:27017/ziririt_posts?authSource=admin',
    mediaStoragePath: process.env.MEDIA_STORAGE_PATH || './media',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    allowedImageTypes: (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp').split(','),
    allowedVideoTypes: (process.env.ALLOWED_VIDEO_TYPES || 'video/mp4,video/quicktime').split(','),
    nodeEnv: process.env.NODE_ENV || 'development',
  };
};
