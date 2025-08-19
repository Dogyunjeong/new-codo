import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { getAppConfig } from './configs/app.config.mts';
import { postRoutes } from './api/post/post.routes.mts';
import { mediaRoutes } from './api/media/media.routes.mts';
import { interactionRoutes } from './api/interaction/interaction.routes.mts';
import { MongoConnectionService } from '@base/server-services';
import { MonitoringMiddleware } from '@base/server-base';
import fs from 'fs/promises';

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

// Register multipart for file uploads
await server.register(multipart, {
  limits: {
    fileSize: appConfig.maxFileSize,
  },
});

// Initialize MongoDB
const mongoConnection = MongoConnectionService.getInstance({ uri: appConfig.databaseUrl });

// Initialize monitoring
const monitoring = new MonitoringMiddleware({
  serviceName: appConfig.serviceName,
  enableRequestLogging: true,
  enableMetrics: true,
  enablePerformanceMonitoring: true,
  slowRequestThresholdMs: 2000
});

// Register monitoring middleware
server.addHook('preHandler', monitoring.requestMonitoring);
server.setErrorHandler(monitoring.errorMonitoring);

// Register monitoring endpoints
server.get('/metrics', monitoring.getMetricsHandler);
server.get('/health/monitoring', monitoring.getMonitoringHealthHandler);

// Register basic health endpoint
server.get('/health', async (request, reply) => {
  try {
    const dbHealthy = await mongoConnection.healthCheck();
    return reply.code(200).send({
      status: dbHealthy ? 'healthy' : 'unhealthy',
      service: appConfig.serviceName,
      timestamp: new Date().toISOString(),
      dependencies: {
        mongodb: {
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

// Register routes
server.register(postRoutes, { prefix: '/posts' });
server.register(mediaRoutes, { prefix: '/media' });
server.register(interactionRoutes, { prefix: '/interactions' });

// Start server
const start = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await mongoConnection.connect();

    // Create media storage directory if it doesn't exist
    try {
      await fs.mkdir(appConfig.mediaStoragePath, { recursive: true });
      console.log(`Media storage directory created at: ${appConfig.mediaStoragePath}`);
    } catch (error) {
      console.log(`Media storage directory already exists or error creating it: ${error}`);
    }

    // Check database health
    const isHealthy = await mongoConnection.healthCheck();
    if (!isHealthy) {
      throw new Error('MongoDB health check failed');
    }

    await server.listen({ 
      host: '0.0.0.0',
      port: appConfig.port 
    });
    console.log(`${appConfig.serviceName} running on port ${appConfig.port}`);

    // Start system monitoring
    monitoring.startSystemMonitoring(30000); // Every 30 seconds
    monitoring.startOperationCleanup(60000);  // Every minute
  } catch (error) {
    console.error('Error starting post service:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully');
  await mongoConnection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully');
  await mongoConnection.close();
  process.exit(0);
});

start();
