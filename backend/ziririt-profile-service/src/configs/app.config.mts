import 'dotenv/config';

export interface AppConfig {
  serviceName: string;
  port: number;
  hostUrl: string;
  databaseUrl: string;
  nodeEnv: string;
}

export const getAppConfig = (): AppConfig => {
  return {
    serviceName: 'ziririt-profile-service',
    port: parseInt(process.env.PORT || '4102', 10),
    hostUrl: process.env.HOST_URL || 'localhost',
    databaseUrl: process.env.DATABASE_URL || 'postgresql://ziririt_user:ziririt_password@localhost:5432/ziririt_db',
    nodeEnv: process.env.NODE_ENV || 'development',
  };
};
