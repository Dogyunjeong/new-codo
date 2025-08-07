import { FastifyRequest, FastifyReply } from 'fastify';

export interface ValidationSchema {
  type: 'object';
  required?: string[];
  properties: Record<string, any>;
  additionalProperties?: boolean;
}

export class ValidationMiddleware {
  /**
   * Creates validation middleware for request body
   */
  static validateBody(schema: ValidationSchema) {
    return {
      schema: { body: schema }
    };
  }

  /**
   * Creates validation middleware for query parameters
   */
  static validateQuery(schema: ValidationSchema) {
    return {
      schema: { querystring: schema }
    };
  }

  /**
   * Creates validation middleware for URL parameters
   */
  static validateParams(schema: ValidationSchema) {
    return {
      schema: { params: schema }
    };
  }

  /**
   * Middleware for custom validation logic
   */
  static customValidation(validationFn: (request: FastifyRequest) => string | null) {
    return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const error = validationFn(request);
      if (error) {
        return reply.code(400).send({ error });
      }
    };
  }
}

// Common validation schemas
export const CommonSchemas = {
  uuid: {
    type: 'string',
    pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  },

  pagination: {
    type: 'object',
    properties: {
      page: { type: 'string', pattern: '^[1-9][0-9]*$' },
      limit: { type: 'string', pattern: '^[1-9][0-9]*$' }
    }
  },

  email: {
    type: 'string',
    format: 'email',
    maxLength: 255
  },

  nonEmptyString: {
    type: 'string',
    minLength: 1
  },

  optionalString: {
    type: 'string'
  },

  datetime: {
    type: 'string',
    format: 'date-time'
  }
};