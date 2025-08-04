import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import { GoalService } from '../services/goal.service.mjs';
import { CreateGoalRequest, UpdateGoalRequest } from '../types/profile.types.mjs';

const goalService = new GoalService();

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

// Auth middleware - simplified for now
async function authenticateUser(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'Missing or invalid authorization header' });
  }
  
  const token = authHeader.substring(7);
  if (!token) {
    return reply.code(401).send({ error: 'Invalid token' });
  }
  
  // Mock implementation - replace with real JWT verification
  (request as any).user = { userId: 'mock-user-id' };
}

export const goalRoutes: FastifyPluginCallback = (fastify: FastifyInstance, options, done) => {
  // Create a new goal
  fastify.post<{ Body: CreateGoalRequest }>('/', {
    preHandler: authenticateUser,
    schema: { body: createGoalSchema },
    handler: async (request, reply) => {
      try {
        const goalData = request.body;
        const currentUser = (request as any).user;

        const goal = await goalService.createGoal(currentUser.userId, goalData);
        
        return reply.code(201).send({ goal });
      } catch (error) {
        request.log.error('Create goal error:', error);
        return reply.code(500).send({ 
          error: 'Failed to create goal',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  // Get a specific goal
  fastify.get<{ Params: { goalId: string } }>('/:goalId', {
    handler: async (request, reply) => {
      try {
        const { goalId } = request.params;
        
        // Get viewer ID from auth token if present
        const authHeader = request.headers.authorization;
        let viewerId: string | undefined;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          // TODO: Extract viewerId from JWT token
          viewerId = undefined;
        }

        const goal = await goalService.getGoalById(goalId, viewerId);
        
        if (!goal) {
          return reply.code(404).send({ error: 'Goal not found or access denied' });
        }

        return reply.code(200).send({ goal });
      } catch (error) {
        request.log.error('Get goal error:', error);
        return reply.code(500).send({ 
          error: 'Failed to get goal',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  // Update a goal
  fastify.put<{ Params: { goalId: string }, Body: UpdateGoalRequest }>('/:goalId', {
    preHandler: authenticateUser,
    schema: { body: updateGoalSchema },
    handler: async (request, reply) => {
      try {
        const { goalId } = request.params;
        const updates = request.body;
        const currentUser = (request as any).user;

        const updatedGoal = await goalService.updateGoal(goalId, currentUser.userId, updates);
        
        return reply.code(200).send({ goal: updatedGoal });
      } catch (error) {
        request.log.error('Update goal error:', error);
        if (error instanceof Error && error.message.includes('not found')) {
          return reply.code(404).send({ error: error.message });
        }
        return reply.code(500).send({ 
          error: 'Failed to update goal',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  // Delete a goal
  fastify.delete<{ Params: { goalId: string } }>('/:goalId', {
    preHandler: authenticateUser,
    handler: async (request, reply) => {
      try {
        const { goalId } = request.params;
        const currentUser = (request as any).user;

        await goalService.deleteGoal(goalId, currentUser.userId);
        
        return reply.code(200).send({ message: 'Goal deleted successfully' });
      } catch (error) {
        request.log.error('Delete goal error:', error);
        if (error instanceof Error && error.message.includes('not found')) {
          return reply.code(404).send({ error: error.message });
        }
        return reply.code(500).send({ 
          error: 'Failed to delete goal',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  // Get user's goals
  fastify.get<{ 
    Params: { userId: string }, 
    Querystring: { page?: string, limit?: string } 
  }>('/user/:userId', {
    handler: async (request, reply) => {
      try {
        const { userId } = request.params;
        
        // Get viewer ID from auth token if present
        const authHeader = request.headers.authorization;
        let viewerId: string | undefined;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          // TODO: Extract viewerId from JWT token
          viewerId = undefined;
        }

        const goals = await goalService.getUserGoals(userId, viewerId);
        
        return reply.code(200).send({ goals });
      } catch (error) {
        request.log.error('Get user goals error:', error);
        return reply.code(500).send({ 
          error: 'Failed to get user goals',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  done();
};