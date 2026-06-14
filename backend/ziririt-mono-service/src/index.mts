import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fs from 'fs/promises';
import appConfig from './configs/app.config.mts';

// Import route arrays from each service
import { authServiceRoutes } from 'ziririt-auth-service/routes';
import { profileServiceRoutes } from 'ziririt-profile-service/routes';
import { postServiceRoutes } from 'ziririt-post-service/routes';
import { feedServiceRoutes } from 'ziririt-feed-service/routes';

// Database services for health checks
import { PostgresConnectionService, MongoConnectionService } from '@base/server-services';

const server = Fastify({
  logger: true,
});

// Register CORS
const isDev = appConfig.nodeEnv === 'development';
const corsOrigins: (string | RegExp)[] = [
  'http://localhost:8081',
  'http://localhost:19000',
  'http://localhost:19006',
  'http://10.0.2.2:8081',
  'exp://*',
  /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/,
  /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/,
];

await server.register(cors, {
  origin: isDev ? true : corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

// Register multipart (needed by post-service media routes)
await server.register(multipart, {
  limits: {
    fileSize: appConfig.maxFileSize,
  },
});

// Register all service routes
const allRoutes = [
  ...authServiceRoutes,
  ...profileServiceRoutes,
  ...postServiceRoutes,
  ...feedServiceRoutes,
];

allRoutes.forEach(({ plugin, prefix }) => {
  server.register(plugin, { prefix });
});

// Resolve DB singletons once for health checks
const pgDb = PostgresConnectionService.getInstance({ connectionString: appConfig.databaseUrl });
const mongoDb = MongoConnectionService.getInstance({ uri: appConfig.mongodbUrl });

// Combined health check
server.get('/health', async (_request, reply) => {
  const pgHealthy = await pgDb.healthCheck().catch(() => false);
  const mongoHealthy = await mongoDb.healthCheck().catch(() => false);

  const isHealthy = pgHealthy && mongoHealthy;

  return reply.code(isHealthy ? 200 : 503).send({
    status: isHealthy ? 'healthy' : 'degraded',
    service: appConfig.serviceName,
    timestamp: new Date().toISOString(),
    services: ['auth', 'profile', 'post', 'feed'],
    databases: {
      postgres: pgHealthy ? 'connected' : 'disconnected',
      mongodb: mongoHealthy ? 'connected' : 'disconnected',
    },
  });
});

// Start server
async function start() {
  try {
    await fs.mkdir(appConfig.mediaStoragePath, { recursive: true }).catch((err) => {
      console.warn('Failed to create media directory:', err.message);
    });

    await server.listen({
      port: appConfig.port,
      host: appConfig.hostUrl,
    });
    console.log(`${appConfig.serviceName} running on port ${appConfig.port}`);
    console.log('Aggregated services: auth, profile, post, feed');
  } catch (error) {
    console.error('Error starting mono-service:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown() {
  console.log('Shutting down gracefully');
  await server.close();
  await pgDb.close().catch(() => {});
  await mongoDb.close().catch(() => {});
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
