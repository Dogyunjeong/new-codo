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
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});

// Initialize database
const db = PostgresConnectionService.getInstance({ connectionString: appConfig.databaseUrl });

// Register routes
server.register(authRoutes);

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