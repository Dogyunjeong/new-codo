import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { getAppConfig } from './configs/app.config.mjs';
import { postRoutes } from './routes/post.routes.mjs';
import { mediaRoutes } from './routes/media.routes.mjs';
import { interactionRoutes } from './routes/interaction.routes.mjs';
import { DatabaseConnection } from './database/db.mjs';
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

// Initialize database
const db = DatabaseConnection.getInstance();

// Register routes
server.register(postRoutes, { prefix: '/posts' });
server.register(mediaRoutes, { prefix: '/media' });
server.register(interactionRoutes, { prefix: '/interactions' });

// Start server
const start = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await db.connect();

    // Initialize indexes
    await db.initializeIndexes();

    // Create media storage directory if it doesn't exist
    try {
      await fs.mkdir(appConfig.mediaStoragePath, { recursive: true });
      console.log(`Media storage directory created at: ${appConfig.mediaStoragePath}`);
    } catch (error) {
      console.log(`Media storage directory already exists or error creating it: ${error}`);
    }

    // Check database health
    const isHealthy = await db.healthCheck();
    if (!isHealthy) {
      throw new Error('MongoDB health check failed');
    }

    await server.listen({ 
      host: '0.0.0.0',
      port: appConfig.port 
    });
    console.log(`${appConfig.serviceName} running on port ${appConfig.port}`);
  } catch (error) {
    console.error('Error starting post service:', error);
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
