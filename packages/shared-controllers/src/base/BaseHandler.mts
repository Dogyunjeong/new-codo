import { FastifyRequest, FastifyReply } from 'fastify';

export interface ErrorResponse {
  error: string;
  details?: any;
}

export interface SuccessResponse<T = any> {
  data?: T;
  message?: string;
}

export abstract class BaseHandler {
  protected handleError(reply: FastifyReply, error: unknown, context: string): void {
    console.error(`Error in ${context}:`, error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        reply.code(404).send({ error: error.message });
      } else if (error.message.includes('already exists') || error.message.includes('already')) {
        reply.code(409).send({ error: error.message });
      } else if (error.message.includes('access denied') || error.message.includes('Access denied')) {
        reply.code(403).send({ error: error.message });
      } else if (error.message.includes('Invalid') || error.message.includes('invalid')) {
        reply.code(400).send({ error: error.message });
      } else {
        reply.code(500).send({ error: `Failed to ${context.toLowerCase()}` });
      }
    } else {
      reply.code(500).send({ error: `Failed to ${context.toLowerCase()}` });
    }
  }

  protected sendSuccess<T>(reply: FastifyReply, data?: T, message?: string, statusCode: number = 200): void {
    const response: SuccessResponse<T> = {};
    
    if (data !== undefined) {
      response.data = data;
    }
    
    if (message) {
      response.message = message;
    }

    reply.code(statusCode).send(response);
  }

  protected sendCreated<T>(reply: FastifyReply, data?: T, message?: string): void {
    this.sendSuccess(reply, data, message, 201);
  }

  protected sendNoContent(reply: FastifyReply): void {
    reply.code(204).send();
  }

  protected requireAuth(request: FastifyRequest): string {
    const userId = (request as any).user?.userId;
    if (!userId) {
      throw new Error('Authentication required');
    }
    return userId;
  }

  protected getOptionalAuth(request: FastifyRequest): string | undefined {
    return (request as any).user?.userId;
  }

  protected parseQueryInt(value: string | undefined, defaultValue: number): number {
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  protected parseQueryBoolean(value: string | undefined, defaultValue: boolean): boolean {
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true';
  }
}