import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import { GoalHandler } from './goal.handler.mts';
import { GoalManagementService } from './GoalManagement.service.mts';
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

export const goalRoutes: FastifyPluginCallback = (fastify: FastifyInstance, options, done) => {
  // Initialize services
  const dbConnection = PostgresConnectionService.getInstance({ connectionString: config.databaseUrl });
  const goalService = new GoalManagementService(dbConnection.getPool());
  const goalHandler = new GoalHandler(goalService);

  // Create a new goal
  fastify.post('/', {
    preHandler: authenticateUser,
    schema: { body: createGoalSchema },
    handler: goalHandler.createGoal.bind(goalHandler),
  });

  // Get a specific goal
  fastify.get('/:goalId', {
    handler: goalHandler.getGoal.bind(goalHandler),
  });

  // Update a goal
  fastify.put('/:goalId', {
    preHandler: authenticateUser,
    schema: { body: updateGoalSchema },
    handler: goalHandler.updateGoal.bind(goalHandler),
  });

  // Delete a goal
  fastify.delete('/:goalId', {
    preHandler: authenticateUser,
    handler: goalHandler.deleteGoal.bind(goalHandler),
  });

  // Get user's goals
  fastify.get('/user/:userId', {
    handler: goalHandler.getUserGoals.bind(goalHandler),
  });

  done();
};