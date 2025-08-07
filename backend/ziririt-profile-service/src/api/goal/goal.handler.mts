import { FastifyRequest, FastifyReply } from 'fastify';
import { GoalManagementService, CreateGoalData, UpdateGoalData } from './GoalManagement.service.mts';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class GoalHandler {
  private goalService: GoalManagementService;

  constructor(goalService: GoalManagementService) {
    this.goalService = goalService;
  }

  async createGoal(request: FastifyRequest<{ Body: CreateGoalData }>, reply: FastifyReply) {
    try {
      const goalData = request.body;
      const currentUser = (request as any).user;

      const goal = await this.goalService.createGoal(currentUser.userId, goalData);
      
      return reply.code(201).send({ goal });
    } catch (error) {
      request.log.error('Create goal error:', error);
      return reply.code(500).send({ 
        error: 'Failed to create goal',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getGoal(request: FastifyRequest<{ Params: { goalId: string } }>, reply: FastifyReply) {
    try {
      const { goalId } = request.params;
      
      // Validate UUID format
      if (!UUID_REGEX.test(goalId)) {
        return reply.code(404).send({ error: 'Goal not found' });
      }
      
      // Get viewer ID from auth token if present
      const authHeader = request.headers.authorization;
      let viewerId: string | undefined;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        // TODO: Extract viewerId from JWT token
        viewerId = undefined;
      }

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
    request: FastifyRequest<{ Params: { goalId: string }, Body: UpdateGoalData }>, 
    reply: FastifyReply
  ) {
    try {
      const { goalId } = request.params;
      const updates = request.body;
      const currentUser = (request as any).user;

      const updatedGoal = await this.goalService.updateGoal(goalId, currentUser.userId, updates);
      
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

  async deleteGoal(request: FastifyRequest<{ Params: { goalId: string } }>, reply: FastifyReply) {
    try {
      const { goalId } = request.params;
      const currentUser = (request as any).user;

      await this.goalService.deleteGoal(goalId, currentUser.userId);
      
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
    request: FastifyRequest<{ 
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
      
      // Get viewer ID from auth token if present
      const authHeader = request.headers.authorization;
      let viewerId: string | undefined;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        // TODO: Extract viewerId from JWT token
        viewerId = undefined;
      }

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