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
  return {
    port: parseInt(process.env.PORT || '4101', 10),
    serviceName: process.env.SERVICE_NAME || 'ziririt-auth-service',
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // Database
    databaseUrl: process.env.DATABASE_URL || 'postgresql://ziririt_user:ziririt_password@localhost:5432/ziririt_db',
    
    // JWT Configuration
    jwtSecret: process.env.JWT_SECRET || 'dev-super-secret-jwt-key-for-local-development-only-32-chars-minimum',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-super-secret-refresh-key-for-local-development-only-32-chars-minimum',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    
    // OAuth Configuration
    googleClientId: process.env.GOOGLE_CLIENT_ID || 'your-google-oauth-client-id',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-oauth-client-secret',
    appleClientId: process.env.APPLE_CLIENT_ID || 'your-apple-app-bundle-id',
    appleTeamId: process.env.APPLE_TEAM_ID || 'your-apple-team-id',
    applePrivateKeyId: process.env.APPLE_PRIVATE_KEY_ID || 'your-apple-private-key-id',
    applePrivateKey: process.env.APPLE_PRIVATE_KEY || 'your-apple-private-key',
    
    // Logging
    logLevel: process.env.LOG_LEVEL || 'info',
  };
};