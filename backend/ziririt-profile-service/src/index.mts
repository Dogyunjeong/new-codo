import Fastify from 'fastify';
import cors from '@fastify/cors';
import { getAppConfig } from './configs/app.config.mts';
import { profileRoutes } from './api/profile/profile.routes.mts';
import { goalRoutes } from './api/goal/goal.routes.mts';
import { socialRoutes } from './api/social/social.routes.mts';
import { PostgresConnectionService } from '@base/server-services';
import { HealthController } from '@base/server-base';

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

// Register simple health route first to test
server.get('/health', async (request, reply) => {
  try {
    const dbHealthy = await db.healthCheck();
    return reply.code(200).send({
      status: dbHealthy ? 'healthy' : 'unhealthy',
      service: appConfig.serviceName,
      timestamp: new Date().toISOString(),
      dependencies: {
        database: {
          status: dbHealthy ? 'healthy' : 'unhealthy'
        }
      }
    });
  } catch (error) {
    return reply.code(503).send({
      status: 'unhealthy',
      service: appConfig.serviceName,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Initialize health controller
const healthController = new HealthController(appConfig.serviceName, [
  {
    name: 'database',
    check: () => db.healthCheck()
  }
]);

// Register additional health routes
server.get('/health/ready', healthController.readiness.bind(healthController));
server.get('/health/live', healthController.liveness.bind(healthController));

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
