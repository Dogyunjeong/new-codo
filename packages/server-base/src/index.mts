import FastifyServer from './baseApp/FastifyServer.mts';
import gcsUtil from './utils/gcp/gcs.util.mts';
export * from './utils/index.mts';
export * from './configs/index.mts';
export * from './db/mongoose.mts';
export { default as mongoQueryBuilder } from './utils/db/mongoQueryBuilder.mts';
export * from './clients/gcp/index.mts';

// Export handlers
export { BaseHandler } from './handlers/base/BaseHandler.mts';
export { CRUDHandler } from './handlers/patterns/CRUDHandler.mts';
export { HealthController } from './handlers/patterns/HealthController.mts';

// Export middleware
export { AuthMiddleware } from './middleware/AuthMiddleware.mts';
export { MonitoringMiddleware } from './middleware/MonitoringMiddleware.mts';
export { ValidationMiddleware } from './middleware/ValidationMiddleware.mts';
export {
  createFirebaseAuthMiddleware,
  getUserIdFromRequest,
  getFirebaseUidFromRequest,
  type AuthenticatedRequest,
} from './middleware/FirebaseAuthMiddleware.mts';

// Export docs
export { OpenAPIGenerator } from './docs/OpenAPIGenerator.mts';

// Route config type for mono-service pattern
export type { RouteConfig } from './types/RouteConfig.mts';

export interface ServerI18n {
  t(key: string, defaultMessage: string, options?: { [key: string]: string | string[] }): string;
}

export { FastifyServer, gcsUtil };
