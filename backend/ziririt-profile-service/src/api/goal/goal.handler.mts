import { FastifyRequest, FastifyReply } from 'fastify';
import { GoalManagementService, CreateGoalData, UpdateGoalData } from './GoalManagement.service.mts';
import { AuthenticatedRequest } from '@base/server-services';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class GoalHandler {
  private goalService: GoalManagementService;

  constructor(goalService: GoalManagementService) {
    this.goalService = goalService;
  }

  async createGoal(request: AuthenticatedRequest & FastifyRequest<{ Body: CreateGoalData }>, reply: FastifyReply) {
    try {
      const goalData = request.body;
      
      if (!request.user?.userId) {
        return reply.code(401).send({ error: 'User not authenticated' });
      }

      const goal = await this.goalService.createGoal(request.user.userId, goalData);
      
      return reply.code(201).send({ goal });
    } catch (error) {
      request.log.error('Create goal error:', error);
      return reply.code(500).send({ 
        error: 'Failed to create goal',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getGoal(request: AuthenticatedRequest & FastifyRequest<{ Params: { goalId: string } }>, reply: FastifyReply) {
    try {
      const { goalId } = request.params;
      
      // Validate UUID format
      if (!UUID_REGEX.test(goalId)) {
        return reply.code(404).send({ error: 'Goal not found' });
      }
      
      // Get viewer ID from authenticated user if present
      const viewerId = request.user?.userId;

      const goal = await this.goalService.getGoalById(goalId, viewerId);
      
      if (!goal) {
        return reply.code(404).send({ error: 'Goal not found or access denied' });
      }

      return reply.code(200).send({ goal });
    } catch (error) {
      request.log.error('Get goal error:', error);
      // Check if it's a UUID validation error from database
      if (error instanceof Error && error.message.includes('invalid input syntax for type uuid')) {
        return reply.code(404).send({ error: 'Goal not found' });
      }
      return reply.code(500).send({ 
        error: 'Failed to get goal',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateGoal(
    request: AuthenticatedRequest & FastifyRequest<{ Params: { goalId: string }, Body: UpdateGoalData }>, 
    reply: FastifyReply
  ) {
    try {
      const { goalId } = request.params;
      const updates = request.body;
      
      if (!request.user?.userId) {
        return reply.code(401).send({ error: 'User not authenticated' });
      }

      const updatedGoal = await this.goalService.updateGoal(goalId, request.user.userId, updates);
      
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
  }

  async deleteGoal(request: AuthenticatedRequest & FastifyRequest<{ Params: { goalId: string } }>, reply: FastifyReply) {
    try {
      const { goalId } = request.params;
      
      if (!request.user?.userId) {
        return reply.code(401).send({ error: 'User not authenticated' });
      }

      await this.goalService.deleteGoal(goalId, request.user.userId);
      
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
  }

  async getUserGoals(
    request: AuthenticatedRequest & FastifyRequest<{ 
      Params: { userId: string }, 
      Querystring: { page?: string, limit?: string } 
    }>, 
    reply: FastifyReply
  ) {
    try {
      const { userId } = request.params;
      
      // Validate UUID format
      if (!UUID_REGEX.test(userId)) {
        return reply.code(404).send({ error: 'User not found' });
      }
      
      // Get viewer ID from authenticated user if present
      const viewerId = request.user?.userId;

      const goals = await this.goalService.getUserGoals(userId, viewerId);
      
      return reply.code(200).send({ goals });
    } catch (error) {
      request.log.error('Get user goals error:', error);
      // Check if it's a UUID validation error from database
      if (error instanceof Error && error.message.includes('invalid input syntax for type uuid')) {
        return reply.code(404).send({ error: 'User not found' });
      }
      return reply.code(500).send({ 
        error: 'Failed to get user goals',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}