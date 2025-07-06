# Project Structure

## Overview
Ziririt is a monorepo language learning application built with TypeScript, using Yarn workspaces for package management. The project follows a microservices architecture with separate frontend and backend services, along with shared packages and deployment configurations.

## Root Structure
```
ziririt-1/
├── backend/                    # Backend services and API gateway
├── frontend/                   # Frontend application
├── packages/                   # Shared packages and utilities
├── deploy/                     # Deployment configurations and scripts
├── context/                    # Project documentation and context
├── plans/                      # Project planning documents
├── package.json               # Root package configuration with workspaces
├── tsconfig.json              # TypeScript configuration
└── yarn.lock                  # Yarn lock file
```

## Backend Structure
```
backend/
├── api-gateway/               # API Gateway configuration
│   ├── Dockerfile.local
│   └── gateway.conf
├── service-boilerplate/       # Main backend service
│   ├── src/
│   │   ├── api/              # API routes and handlers
│   │   ├── configs/          # Application configuration
│   │   └── index.mts         # Main entry point
│   ├── dist/                 # Compiled JavaScript output
│   ├── logs/                 # Application logs
│   ├── package.json          # Service dependencies
│   └── tsconfig.json         # TypeScript configuration
├── Dockerfile.local          # Development Docker configuration
├── Dockerfile.prod           # Production Docker configuration
└── ecosystem.config.cjs      # PM2 process management
```

## Frontend Structure
```
frontend/
└── Dockerfile.prod           # Production Docker configuration
```

## Shared Packages
All shared packages are located in `/packages/` and use TypeScript with `.mts` extensions:

### base-server
Core server functionality and utilities:
- **FastifyServer**: Main server implementation
- **Clients**: GCP integrations (Cloud Tasks, GCS)
- **Configs**: Base configuration management
- **DB**: MongoDB/Mongoose integration
- **Handlers**: Fastify request handlers
- **Utils**: Common utilities (JWT, logging, debugging)

### shared-controllers
Reusable controller implementations:
- **Boilerplate.controller**: Example controller structure

### shared-services
Business logic and data models:
- **Models**: Data models and schemas
- **Boilerplate.model**: Example model structure

### shared-types
TypeScript type definitions:
- **admin/**: Admin-related types (CloudTasks, CustomSetting)
- **language/**: Language-related types
- **shared/**: Common types (Env, File, Validator)
- **user/**: User-related types (LearningProgress)

### shared-utils
Common utility functions:
- **error/**: Error handling utilities
- **file/**: File manipulation utilities
- **languages/**: Language and locale utilities
- **requests/**: HTTP request utilities
- **storage/**: GCS storage utilities
- **url/**: URL manipulation utilities
- **validator/**: Input validation utilities

## Deployment Structure
```
deploy/
├── gcp-pulumi/               # Google Cloud Platform deployment using Pulumi
│   ├── configs/              # Pulumi configuration
│   ├── deploys/              # Deployment scripts
│   ├── pulumiUtil/           # Pulumi utilities
│   ├── types/                # Deployment-specific types
│   └── package.json          # Pulumi dependencies
├── deploy-test/              # Testing deployment configuration
│   ├── docker-compose.yml
│   └── deploy-test.env
├── local/                    # Local development environment
│   ├── docker-compose.yml
│   ├── local.env
│   └── mongo-init.js
└── keys/                     # Authentication keys (not tracked in git)
```

## Key Technologies
- **Language**: TypeScript with ES modules (.mts files)
- **Package Manager**: Yarn v4.9.2 with workspaces
- **Backend Framework**: Fastify (via base-server)
- **Database**: MongoDB with Mongoose
- **Process Management**: PM2
- **Cloud Platform**: Google Cloud Platform
- **Infrastructure**: Pulumi for IaC
- **Containerization**: Docker
- **Testing**: Vitest

## Development Workflow
1. **Workspace Management**: Uses Yarn workspaces with hoisting limits
2. **TypeScript**: Strict TypeScript configuration with ES modules
3. **Build System**: TSup for TypeScript compilation
4. **Process Management**: PM2 for production process management
5. **Development**: Hot reloading with nodemon and concurrent builds
6. **Testing**: Vitest for unit testing
7. **Deployment**: Pulumi for cloud infrastructure management

## Environment Configuration
- **Development**: Local Docker Compose setup
- **Testing**: Separate testing environment configuration
- **Production**: GCP Cloud Run with Pulumi deployment

## Notes
- All shared packages use workspace dependencies (`workspace:^`)
- Frontend structure appears minimal, suggesting a separate frontend codebase or SPA
- Strong emphasis on type safety with comprehensive TypeScript types
- Microservices architecture with shared utilities and types
- Cloud-native deployment strategy using containerization