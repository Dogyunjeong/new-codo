import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import { JourneyHandler } from './journey.handler.mts';
import { JourneyManagementService } from './JourneyManagement.service.mts';
import { PostgresConnectionService, createFirebaseAuthMiddleware, AuthenticatedRequest } from '@base/server-services';
import { getAppConfig } from '../../configs/app.config.mts';

// Request schemas
const createGoalSchema = {
  type: 'object',
  required: ['title'],
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 200 },
    description: { type: 'string', maxLength: 1000 },
    isPrivate: { type: 'boolean' },
  },
};

const updateGoalSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 200 },
    description: { type: 'string', maxLength: 1000 },
    isPrivate: { type: 'boolean' },
  },
};

// Get auth middleware instance
const config = getAppConfig();
const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:4101';
const authenticateUser = createFirebaseAuthMiddleware(authServiceUrl);

export const journeyRoutes: FastifyPluginCallback = (fastify: FastifyInstance, options, done) => {
  // Initialize services
  const dbConnection = PostgresConnectionService.getInstance({ connectionString: config.databaseUrl });
  const journeyService = new JourneyManagementService(dbConnection.getPool());
  const journeyHandler = new JourneyHandler(journeyService);

  // Create a new journey
  fastify.post('/', {
    preHandler: authenticateUser,
    schema: { body: createGoalSchema },
    handler: journeyHandler.createJourney.bind(journeyHandler),
  });

  // Get user's journeys (define before dynamic :journeyId to avoid route conflicts)
  fastify.get('/user/:userId', {
    handler: journeyHandler.getUserJourneys.bind(journeyHandler),
  });

  // Get a specific journey
  fastify.get('/:journeyId', {
    handler: journeyHandler.getJourney.bind(journeyHandler),
  });

  // Update a journey
  fastify.put('/:journeyId', {
    preHandler: authenticateUser,
    schema: { body: updateGoalSchema },
    handler: journeyHandler.updateJourney.bind(journeyHandler),
  });

  // Delete a journey
  fastify.delete('/:journeyId', {
    preHandler: authenticateUser,
    handler: journeyHandler.deleteJourney.bind(journeyHandler),
  });

  done();
};
