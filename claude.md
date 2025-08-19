# Rules

- always ultra think for reasoning.
- always ultra think first before coding and depend on coding tasks use right method
- always refer to `./context`

## code generation priority

1. readability
2. modularizing
3. workable solution

# Environment

## local environment

- **IMPORTANT**: ALL backend services and databases MUST be run in Docker containers for both development and testing
- Backend services are accessed via exposed ports (auth: 4101, profile: 4102, post: 4103, feed: 4104)
- Frontend should be run on local (not in Docker)
- Use `docker compose -f deploy/local/docker-compose.yml` to manage all backend services

## Environment Configuration

### **CRITICAL RULE: Backend Service Environment Variables**
- **ALL backend service environment variables MUST be defined in a single `BASE_ENV_JSON` in `/deploy/local/local.env`**
- **The `BASE_ENV_JSON` contains JSON stringified configuration for ALL services**
- **Individual service `.env` files are NOT allowed in backend services**
- **Services MUST use `@packages/server-base/src/utils/getEnvironment.mts` to parse BASE_ENV_JSON**
- **Environment types are defined in `@packages/shared-types/src/shared/Env.type.mts`**
- **Each service overrides only SERVICE_NAME and PORT in docker-compose.yml**

### Environment Structure:
```bash
# In /deploy/local/local.env - Single BASE_ENV_JSON for all services
BASE_ENV_JSON='{
  "NODE_ENV": "development",
  "APP_ENV": "local",
  "HOST_URL": "0.0.0.0",
  "HTTP_PORT": 4100,
  "SERVICE_NAME": "ziririt-services",
  "AUTH_SERVICE_URL": "http://ziririt-auth-service:4101",
  "PROFILE_SERVICE_URL": "http://ziririt-profile-service:4102",
  "DATABASE_URL": "postgresql://...",
  "MONGODB_URL": "mongodb://...",
  ...all other configs...
}'
```

### Docker Compose Configuration:
```yaml
# Each service gets the same BASE_ENV_JSON but overrides SERVICE_NAME and PORT
ziririt-auth-service:
  env_file:
    - ./local.env  # Gets BASE_ENV_JSON
  environment:
    NODE_ENV: development
    PORT: 4101  # Service-specific port override
    SERVICE_NAME: ziririt-auth-service  # Service-specific name override
```

### Service Usage:
```typescript
// In any backend service
import { getBaseEnvironment } from '@base/server-base/utils';

// Get environment (PORT and SERVICE_NAME are overridden by Docker)
const env = getBaseEnvironment();
console.log(env.SERVICE_NAME); // 'ziririt-auth-service' (from Docker override)
console.log(env.AUTH_SERVICE_URL); // 'http://ziririt-auth-service:4101' (from BASE_ENV_JSON)
```

### Benefits:
- **Simplified maintenance**: One JSON config for all services
- **Easy deployment**: Change one file to update all services
- **No conflicts**: All services share the same base configuration
- **Service-specific overrides**: Docker handles PORT and SERVICE_NAME per service
- **Type-safe**: Full TypeScript support via shared-types

# project structure

This is yarn workspace mono repo.
`./frontend` and `./backend` is sharing `./packages`

## `./packages`

### Package Naming Convention and Rules

**CRITICAL**: Packages must follow strict naming conventions to ensure proper separation of concerns:

#### Naming Prefixes:
- `shared-*`: Platform-agnostic packages that can run in ANY JavaScript environment
  - MUST NOT include Node.js standard library (fs, path, crypto, etc.)
  - MUST NOT include browser-specific APIs (DOM, window, localStorage)
  - MUST NOT include React Native specific APIs
  - MUST NOT import from `server-*` or `front-*` packages
  - CAN only use pure JavaScript/TypeScript
  - CAN only depend on other `shared-*` packages
  - Examples: `shared-types`, `shared-utils`, `shared-api-controllers`

- `server-*`: Server-only packages for backend services
  - CAN use Node.js standard library
  - CAN use server frameworks (Fastify, Express, etc.)
  - CAN use database drivers (MongoDB, PostgreSQL, etc.)
  - MUST NOT be imported by frontend packages
  - Examples: `server-base`, `server-services`, `server-handlers`

- `front-*`: Frontend-only packages for client applications
  - CAN use React/React Native APIs
  - CAN use browser APIs (for web) or React Native APIs (for mobile)
  - CAN use frontend frameworks and libraries
  - MUST NOT use Node.js standard library
  - MUST NOT be imported by backend packages
  - Examples: `front-components`, `front-utils`, `front-hooks`

### Dependency Injection for Shared Packages

When shared packages need platform-specific functionality:
- Use dependency injection through constructor parameters or configuration objects
- Define interfaces for platform-specific services (e.g., ILogger, IStorage)
- Allow consumers to provide their own implementations
- Provide sensible defaults that work across platforms when possible

Example:
```typescript
// In shared package - define interface
interface ILogger {
  error(message: string, error?: any): void;
  info(message: string, context?: any): void;
}

// Consumer provides implementation
const logger = isServer ? new ServerLogger() : new BrowserLogger();
const client = new ApiClient({ logger });
```

### Current Package Structure:

- `./packages/shared-types` - Pure TypeScript type definitions
  - Used by both frontend and backend
  - No runtime code, only types and interfaces

- `./packages/shared-api-controllers` - API controller implementations
  - Used to communicate with backend microservices
  - Must be platform-agnostic (works in browser, React Native, and Node.js)
  - Uses fetch or axios for HTTP requests

- `./packages/server-services` - Backend service implementations
  - Base models and service logic for backend
  - Node.js specific implementations

- `./packages/server-base` - Base server infrastructure
  - Fastify server setup, handlers, middleware
  - Database connections and utilities
  - Server-specific utilities

### API Controllers

API controllers are used to call backend services from frontend or other services:
- Located in `./packages/shared-api-controllers/src/[Domain].controller.mts`
- Host URL is passed from each service or frontend
- Must be isomorphic (work in all JavaScript environments)

## `./backend`

backend will be consisted with micro services. These microservices are just for easing development with separate concerns by domain levels
in the beginning, will be separated by domain levels and in the future it will be separated by concerns

backend MSA endpoints will be defined and can be used in `./packages/shared-api-controllers` to communicate in between frontend and services.
there is `./backend/api-gateway` to ease communications

- all backend services must meet type definitions in `./packages/shared-types`
- communicate backend endpoints with `./packages/shared-api-controllers`

### Service

#### Architecture

Based on onion architecture and domain driven architecture
My focusing is modularizing codes
There are base services and models which can be used in specific services.

##### Shared models and services

Theses are most primitive service and models and should be located in `./packages/server-services`

- basic user service logic and models should be located in here

##### Services

Use Domain and concern focused architecture.

- folder structure
  - `./backend/*/src/api/[domain]`
    - `[domain].routes.mts`
    - `[domain].handler.mts`
    - `[domain/concern].service.mts`
      - every concern will be a service.
        - e.g `UserSignUp.service.mts`, `UserSSO.service.mts`
          - user sign up service import `UserService` and `UserModel` from `./packages/server-services`
      - higher level service can be existing over certain concern services.
        - `*.2nd.service.mts`, `*.3rd.service.mts`

## `./frontend`

frontend will contains all frontend services for clients or admin.

- all frontend services must meet type definitions in `./packages/shared-types`
- communicate backend endpoints with `./packages/shared-api-controllers`
- **IMPORTANT**: Whenever a feature is added in frontend, corresponding e2e test codes MUST be added

### Frontend Page Creation Methodology

#### Design Analysis Phase (When Design Files Provided)

1. **Analyze Design Files First**
   - If screenshots, mockups, or design files are provided, analyze them thoroughly before any coding
   - Identify all UI components, layouts, interactions, and visual elements
   - Understand the user flow and navigation patterns
   - Note color schemes, typography, spacing, and responsive behavior
   - Document any animations, transitions, or micro-interactions

#### Component-First Development Approach

1. **Component Structure Planning**
   - Break down the page/screen into logical component hierarchy
   - Identify reusable components vs page-specific components
   - Plan component interfaces (props) and data flow
   - Consider component composition and nesting relationships
   - Document component responsibilities and dependencies

2. **Component Requirements Definition**
   - Define props interface for each component
   - Specify component behavior and interactions
   - Plan state management requirements
   - Identify API integration points
   - Document accessibility requirements
   - Plan loading states and error handling

3. **Component Implementation Order**
   - Start with the most primitive/reusable components
   - Build components from bottom-up (leaf components first)
   - Implement components in dependency order
   - Create components with proper TypeScript interfaces
   - Add proper styling and responsive behavior
   - Include loading indicators and error states

4. **Page/Screen Assembly**
   - Compose the page using the created components
   - Implement page-level state management
   - Add page-specific logic and API calls
   - Implement navigation and routing
   - Add page-level error boundaries
   - Ensure proper accessibility and SEO

#### Implementation Guidelines

- **Component Structure**: Use functional components with explicit props interfaces
- **Styling**: Use Tailwind CSS with component-specific class naming
- **State Management**: Use React hooks for local state, consider context for shared state
- **API Integration**: Use shared controllers from `@base/shared-controllers`
- **Loading States**: Always include loading indicators for async operations
- **Error Handling**: Implement proper error boundaries and user feedback
- **Accessibility**: Follow WCAG guidelines and include proper ARIA attributes
- **Testing**: Create unit tests for components and integration tests for pages

## `./plans`

this is build plans for current projects

## `./deploy`

this folder is to container docker-compose.yml or other IaC files to deploy for local, dev, and prod
there is a `./deploy/deploy-test` to check build docker images with `./*/Dockerfile.prd` to test building images before deploy to cloud environment

### Local env

- `./deploy/local/docker-compose.yml` is for local docker environment
- `./*/Dockerfile.local` is used for local docker build to reduce image size and sync files.
- `./deploy/local/local.env` is env file to contains docker local environments
  - environments should one json string, therefore, it could be easily manageable with GCP secret manager.

## test

### unit test

unit test will be located next to testing target file name with `*.test.mts`
unit test will be ran by vite test

### API tests

All API and integration tests are located in `./test/api-tests/`

#### Test Structure

- `./test/api-tests/api/controllers/` - Tests using shared controllers (preferred method)
- `./test/api-tests/api/direct/` - Direct HTTP API tests for caching, performance, and low-level behavior
- `./test/api-tests/api/integration/` - Cross-service integration tests
- `./test/api-tests/api/examples/` - Service usage examples

#### Testing Guidelines

- **IMPORTANT**: Whenever a backend feature is added, corresponding API tests MUST be added
- Use shared API controllers from `@base/shared-api-controllers` for most API testing
- Use direct HTTP tests only for testing caching behavior, performance benchmarks, or low-level HTTP features
- All API tests should include performance validation (response time targets)
- Tests should cover error handling and edge cases

### frontend test

Frontend tests will be located in `./test/frontend/` (to be created)
Every frontend feature implementation MUST include corresponding tests
Tests should cover user interactions and expected outcomes

# Feature Implementation guideline

### steps

1. plan/check PRD for requested features
2. create types in `./packages/shared-types` according to step 1

-

## Shared types

typescript is used for frontend, backend, and IaC
`./packages/shared-types` are copy of truth. We will always based on the domain types in `shared-types`

## backend

always using micro service approach. Current building is MVP building. Therefore, micro service concern is splitting domain concern.

### Backend Service Creation Rules

When creating a new backend service, follow the patterns in `@backend/service-boilerplate`:

1. **package.json scripts** - Must match the boilerplate exactly:
   ```json
   "scripts": {
     "build": "tsup-node",
     "start": "pm2 start ecosystem.config.cjs",
     "start:prod": "pm2 start ecosystem.config.cjs --env production",
     "stop": "pm2 stop ecosystem.config.cjs",
     "dev": "tsup-node --watch --sourcemap inline --onSuccess 'node dist/index.js'",
     "dev:build": "tsup-node --watch --sourcemap",
     "dev:run": "NODE_OPTIONS='--enable-source-maps' nodemon dist/index.js --watch dist",
     "dev:watch": "yarn install && concurrently \"yarn dev:build\" \"yarn dev:run\""
   }
   ```

2. **tsup.config.ts** - Must use this configuration:
   ```typescript
   import { defineConfig } from 'tsup';
   
   export default defineConfig(() => {
     return {
       entry: ['src/index.mts'],
       target: 'node22',
       format: ['esm'],
       noExternal: [/@base\/.+$/],
       splitting: false,
       sourcemap: true,
       platform: 'node',
       clean: true,
     };
   });
   ```

3. **Build Process**:
   - Services MUST compile TypeScript to JavaScript using `tsup-node` 
   - Compiled output goes to `dist/index.js`
   - PM2 runs the compiled JavaScript, NOT TypeScript directly
   - This avoids TypeScript enum issues in Node.js v22+ strip-only mode
   - The `noExternal: [/@base\/.+$/]` pattern bundles all @base packages to avoid runtime TypeScript issues
