import Fastify from 'fastify';
import cors from '@fastify/cors';
import { getAppConfig } from './configs/app.config.mts';
import { authRoutes } from './api/auth/auth.routes.mts';
import { PostgresConnectionService } from '@base/server-services';

const appConfig = getAppConfig();

const server = Fastify({
  logger: true,
});

// Register CORS
await server.register(cors, {
  origin: [
    'http://localhost:8081',     // Expo web
    'http://localhost:19000',    // Expo classic
    'http://localhost:19006',    // Expo web classic
    'http://10.0.2.2:8081',     // Android emulator
    'http://192.168.*.*:*',     // Local network
    'exp://*',                   // Expo client
    /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/, // Local network IPs
    /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/, // Private network IPs
    true                         // Allow all origins in development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});

// Initialize database
const db = PostgresConnectionService.getInstance({ connectionString: appConfig.databaseUrl });

// Register routes with /api/auth prefix
server.register(authRoutes, { prefix: '/api/auth' });

// Start server
const start = async (): Promise<void> => {
  try {
    // Skip schema initialization - database is already set up by init script
    console.log('Skipping database schema initialization - using existing schema');

    // Check database health
    const isHealthy = await db.healthCheck();
    if (!isHealthy) {
      throw new Error('Database health check failed');
    }

    await server.listen({ 
      host: '0.0.0.0',
      port: appConfig.port 
    });
    console.log(`${appConfig.serviceName} running on port ${appConfig.port}`);
  } catch (error) {
    console.error('Error starting auth service:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully');
  await db.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully');  
  await db.close();
  process.exit(0);
});

start();