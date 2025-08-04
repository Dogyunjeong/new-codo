import Fastify from 'fastify';
import cors from '@fastify/cors';
import { getAppConfig } from './configs/app.config.mjs';
import { profileRoutes } from './routes/profile.routes.mjs';
import { goalRoutes } from './routes/goal.routes.mjs';
import { socialRoutes } from './routes/social.routes.mjs';
import { DatabaseConnection } from './database/db.mjs';

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
const db = DatabaseConnection.getInstance();

// Register routes
server.register(profileRoutes, { prefix: '/profiles' });
server.register(goalRoutes, { prefix: '/goals' });
server.register(socialRoutes, { prefix: '/social' });

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
    console.error('Error starting profile service:', error);
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
