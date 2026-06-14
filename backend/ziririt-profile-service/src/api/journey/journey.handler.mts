import { FastifyRequest, FastifyReply } from 'fastify';
import { JourneyManagementService, CreateJourneyData, UpdateJourneyData } from './JourneyManagement.service.mts';

type AuthenticatedRequest = FastifyRequest & {
  user?: {
    userId: string;
    email?: string;
    firebaseUid?: string;
  };
};

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class JourneyHandler {
  private journeyService: JourneyManagementService;

  constructor(journeyService: JourneyManagementService) {
    this.journeyService = journeyService;
  }

  async createJourney(request: AuthenticatedRequest & FastifyRequest<{ Body: CreateJourneyData }>, reply: FastifyReply) {
    try {
      const goalData = request.body;
      
      if (!request.user?.userId) {
        return reply.code(401).send({ error: 'User not authenticated' });
      }

      const goal = await this.journeyService.createJourney(request.user.userId, goalData);
      
      return reply.code(201).send({ goal });
    } catch (error) {
      request.log.error('Create journey error:', error);
      return reply.code(500).send({ 
        error: 'Failed to create journey',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getJourney(request: AuthenticatedRequest & FastifyRequest<{ Params: { journeyId: string } }>, reply: FastifyReply) {
    try {
      const { journeyId: goalId } = request.params;
      
      // Validate UUID format
      if (!UUID_REGEX.test(goalId)) {
        return reply.code(404).send({ error: 'Journey not found' });
      }
      
      // Get viewer ID from authenticated user if present
      const viewerId = request.user?.userId;

      const goal = await this.journeyService.getJourneyById(goalId, viewerId);
      
      if (!goal) {
        return reply.code(404).send({ error: 'Journey not found or access denied' });
      }

      return reply.code(200).send({ goal });
    } catch (error) {
      request.log.error('Get journey error:', error);
      // Check if it's a UUID validation error from database
      if (error instanceof Error && error.message.includes('invalid input syntax for type uuid')) {
        return reply.code(404).send({ error: 'Journey not found' });
      }
      return reply.code(500).send({ 
        error: 'Failed to get journey',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateJourney(
    request: AuthenticatedRequest & FastifyRequest<{ Params: { journeyId: string }, Body: UpdateJourneyData }>, 
    reply: FastifyReply
  ) {
    try {
      const { journeyId: goalId } = request.params;
      // Validate UUID format
      if (!UUID_REGEX.test(goalId)) {
        return reply.code(404).send({ error: 'Journey not found' });
      }
      const updates = request.body;
      
      if (!request.user?.userId) {
        return reply.code(401).send({ error: 'User not authenticated' });
      }

      const updatedGoal = await this.journeyService.updateJourney(goalId, request.user.userId, updates);
      
      return reply.code(200).send({ goal: updatedGoal });
    } catch (error) {
      request.log.error('Update journey error:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.code(404).send({ error: error.message });
      }
      if (error instanceof Error && error.message.includes('No fields to update')) {
        return reply.code(400).send({ error: error.message });
      }
      if (error instanceof Error && error.message.includes('invalid input syntax for type uuid')) {
        return reply.code(404).send({ error: 'Journey not found' });
      }
      return reply.code(500).send({ 
        error: 'Failed to update journey',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async deleteJourney(request: AuthenticatedRequest & FastifyRequest<{ Params: { journeyId: string } }>, reply: FastifyReply) {
    try {
      const { journeyId: goalId } = request.params;
      // Validate UUID format
      if (!UUID_REGEX.test(goalId)) {
        return reply.code(404).send({ error: 'Journey not found' });
      }
      
      if (!request.user?.userId) {
        return reply.code(401).send({ error: 'User not authenticated' });
      }

      await this.journeyService.deleteJourney(goalId, request.user.userId);
      
      return reply.code(200).send({ message: 'Journey deleted successfully' });
    } catch (error) {
      request.log.error('Delete journey error:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.code(404).send({ error: error.message });
      }
      if (error instanceof Error && error.message.includes('invalid input syntax for type uuid')) {
        return reply.code(404).send({ error: 'Journey not found' });
      }
      return reply.code(500).send({ 
        error: 'Failed to delete journey',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getUserJourneys(
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

      const goals = await this.journeyService.getUserJourneys(userId, viewerId);
      
      return reply.code(200).send({ journeys: goals });
    } catch (error) {
      request.log.error('Get user journeys error:', error);
      // Check if it's a UUID validation error from database
      if (error instanceof Error && error.message.includes('invalid input syntax for type uuid')) {
        return reply.code(404).send({ error: 'User not found' });
      }
      return reply.code(500).send({ 
        error: 'Failed to get user journeys',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
