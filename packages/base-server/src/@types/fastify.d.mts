import FastifyRequest from 'fastify';
import Logger from '../utils/logger.mjs';
import { UserTypes } from '@base/shared-types';

declare module 'fastify' {
  export interface FastifyRequest {
    i18n: {
      t: (key: string, options?: any) => string;
    };
    logger: Logger;
    locals?: {
      user?: UserTypes.User;
    };
  }
}

export default 'fastify';
