// Service Controllers
export { default as AuthController } from './Auth.controller.mts';
export { default as ProfileController } from './Profile.controller.mts';
export { default as PostController } from './Post.controller.mts';
export { default as FeedController } from './Feed.controller.mts';

// Legacy controller
export { default as BoilerPlateController } from './Boilerplate.controller.mts';

// Service Architecture
export * from './ServiceController.mts';

// Base classes
export * from './base/BaseHandler.mts';

// Middleware
export * from './middleware/AuthMiddleware.mts';
export * from './middleware/ValidationMiddleware.mts';
export * from './middleware/MonitoringMiddleware.mts';

// Patterns
export * from './patterns/CRUDHandler.mts';
export * from './patterns/HealthController.mts';

// Documentation
export * from './docs/OpenAPIGenerator.mts';
