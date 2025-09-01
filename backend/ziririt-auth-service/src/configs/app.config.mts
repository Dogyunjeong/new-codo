import { getServiceEnvironment } from '@base/server-base';
import { AuthServiceEnv } from '@base/shared-types';

export interface AppConfig {
  port: number;
  serviceName: string;
  nodeEnv: string;
  
  // Database
  databaseUrl: string;
  
  // JWT Configuration
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;
  
  // GCP Identity Platform Configuration
  gcpProjectId: string;
  gcpApiKey: string;
  firebaseProjectId?: string; // Alias for gcpProjectId
  firebaseClientEmail?: string;
  firebasePrivateKey?: string;
  
  // Firebase Service Account (for Admin SDK)
  firebaseServiceAccount?: {
    projectId: string;
    clientEmail: string;
    privateKey: string;
  };
  
  // OAuth Configuration
  googleClientId: string;
  googleClientSecret: string;
  appleClientId: string;
  appleTeamId: string;
  applePrivateKeyId: string;
  applePrivateKey: string;
  
  // Logging
  logLevel: string;
}

export const getAppConfig = (): AppConfig => {
  // Get environment configuration from BASE_ENV_JSON
  const env = getServiceEnvironment('ziririt-auth-service') as AuthServiceEnv;
  
  return {
    port: parseInt(process.env.PORT || String(env.HTTP_PORT) || '4101', 10),
    serviceName: process.env.SERVICE_NAME || env.SERVICE_NAME || 'ziririt-auth-service',
    nodeEnv: env.NODE_ENV || 'development',
    
    // Database
    databaseUrl: env.DATABASE_URL || 'postgresql://ziririt_user:ziririt_password@localhost:5432/ziririt_db',
    
    // JWT Configuration
    jwtSecret: env.JWT_SECRET || 'dev-super-secret-jwt-key-for-local-development-only-32-chars-minimum',
    jwtRefreshSecret: env.JWT_REFRESH_SECRET || 'dev-super-secret-refresh-key-for-local-development-only-32-chars-minimum',
    jwtExpiresIn: env.JWT_EXPIRES_IN || '15m',
    jwtRefreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN || '7d',
    
    // GCP Identity Platform Configuration
    gcpProjectId: env.GCP_PROJECT_ID || env.FIREBASE_PROJECT_ID || 'ziririt-dev',
    gcpApiKey: env.GCP_API_KEY || '',
    firebaseProjectId: env.FIREBASE_PROJECT_ID || env.GCP_PROJECT_ID || 'ziririt-dev',
    firebaseClientEmail: env.FIREBASE_CLIENT_EMAIL || '',
    firebasePrivateKey: env.FIREBASE_PRIVATE_KEY || '',
    
    // Firebase Service Account (for Admin SDK)
    firebaseServiceAccount: env.FIREBASE_SERVICE_ACCOUNT ? 
      JSON.parse(env.FIREBASE_SERVICE_ACCOUNT) : 
      {
        projectId: env.FIREBASE_PROJECT_ID || env.GCP_PROJECT_ID || 'ziririt-dev',
        clientEmail: env.FIREBASE_CLIENT_EMAIL || '',
        privateKey: env.FIREBASE_PRIVATE_KEY || '',
      },
    
    // OAuth Configuration
    googleClientId: env.GOOGLE_CLIENT_ID || 'your-google-oauth-client-id',
    googleClientSecret: env.GOOGLE_CLIENT_SECRET || 'your-google-oauth-client-secret',
    appleClientId: env.APPLE_CLIENT_ID || 'your-apple-app-bundle-id',
    appleTeamId: env.APPLE_TEAM_ID || 'your-apple-team-id',
    applePrivateKeyId: env.APPLE_PRIVATE_KEY_ID || 'your-apple-private-key-id',
    applePrivateKey: env.APPLE_PRIVATE_KEY || 'your-apple-private-key',
    
    // Logging
    logLevel: env.LOG_LEVEL || 'info',
  };
};