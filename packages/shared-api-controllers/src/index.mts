// API Controllers - Used to communicate with backend services
export { default as AuthController } from './Auth.controller.mts';
export { default as ProfileController } from './Profile.controller.mts';
export { default as PostController } from './Post.controller.mts';
export { default as FeedController } from './Feed.controller.mts';
export { default as BoilerPlateController } from './Boilerplate.controller.mts';

// Backward compatibility - export with old names
export { default as AuthClient } from './Auth.controller.mts';
export { default as ProfileClient } from './Profile.controller.mts';
export { default as PostClient } from './Post.controller.mts';
export { default as FeedClient } from './Feed.controller.mts';
export { default as BoilerPlateClient } from './Boilerplate.controller.mts';

// Service Architecture
export * from './ServiceController.mts';
