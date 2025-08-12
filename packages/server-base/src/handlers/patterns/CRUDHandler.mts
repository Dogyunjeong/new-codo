import { FastifyRequest, FastifyReply } from 'fastify';
import { BaseHandler } from '../base/BaseHandler.mts';

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface CRUDService<T, CreateData, UpdateData> {
  create(data: CreateData, userId?: string): Promise<T>;
  getById(id: string, viewerId?: string): Promise<T | null>;
  update(id: string, data: UpdateData, userId?: string): Promise<T>;
  delete(id: string, userId?: string): Promise<void>;
  list(page?: number, limit?: number, filters?: any): Promise<PaginatedResponse<T>>;
}

export interface CRUDParams {
  id: string;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export abstract class CRUDHandler<T, CreateData, UpdateData> extends BaseHandler {
  protected service: CRUDService<T, CreateData, UpdateData>;

  constructor(service: CRUDService<T, CreateData, UpdateData>) {
    super();
    this.service = service;
  }

  async create(request: FastifyRequest<{ Body: CreateData }>, reply: FastifyReply): Promise<void> {
    try {
      const userId = this.getOptionalAuth(request);
      const item = await this.service.create(request.body, userId);
      this.sendCreated(reply, item);
    } catch (error) {
      this.handleError(reply, error, 'create item');
    }
  }

  async getById(request: FastifyRequest<{ Params: CRUDParams }>, reply: FastifyReply): Promise<void> {
    try {
      const { id } = request.params;
      const viewerId = this.getOptionalAuth(request);
      
      const item = await this.service.getById(id, viewerId);
      if (!item) {
        return reply.code(404).send({ error: 'Item not found' });
      }
      
      this.sendSuccess(reply, item);
    } catch (error) {
      this.handleError(reply, error, 'get item');
    }
  }

  async update(request: FastifyRequest<{ Params: CRUDParams; Body: UpdateData }>, reply: FastifyReply): Promise<void> {
    try {
      const { id } = request.params;
      const userId = this.requireAuth(request);
      
      const item = await this.service.update(id, request.body, userId);
      this.sendSuccess(reply, item);
    } catch (error) {
      this.handleError(reply, error, 'update item');
    }
  }

  async delete(request: FastifyRequest<{ Params: CRUDParams }>, reply: FastifyReply): Promise<void> {
    try {
      const { id } = request.params;
      const userId = this.requireAuth(request);
      
      await this.service.delete(id, userId);
      this.sendNoContent(reply);
    } catch (error) {
      this.handleError(reply, error, 'delete item');
    }
  }

  async list(request: FastifyRequest<{ Querystring: PaginationQuery }>, reply: FastifyReply): Promise<void> {
    try {
      const { page = '1', limit = '20' } = request.query;
      
      const result = await this.service.list(
        this.parseQueryInt(page, 1),
        this.parseQueryInt(limit, 20)
      );
      
      this.sendSuccess(reply, result);
    } catch (error) {
      this.handleError(reply, error, 'list items');
    }
  }
}