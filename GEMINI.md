# GEMINI.md

This file provides guidance to Gemini when working with code in this repository.

## Project Overview

Ziririt - A social platform for journey sharing and progress tracking. Built with microservices architecture, React Native mobile client, and TypeScript throughout.

## Commands

### Backend Development

```bash
# Start all backend services (MongoDB, PostgreSQL, Redis + microservices)
cd deploy/local && docker-compose up -d

# Service URLs when running:
# - API Gateway: http://localhost:8080
# - Auth Service: http://localhost:4101
# - Profile Service: http://localhost:4102
# - Post Service: http://localhost:4103
# - Feed Service: http://localhost:4104
# - PostgreSQL: localhost:5432
# - MongoDB: localhost:27017
# - Redis: localhost:6379

# Stop all services
cd deploy/local && docker-compose down

# View logs
cd deploy/local && docker-compose logs -f [service-name]

# Restart a specific service
cd deploy/local && docker-compose restart [service-name]
```

### Mobile App Development

```bash
# Install dependencies
cd frontend/mobile_client && yarn install

# Run iOS
yarn ios

# Run Android
yarn android

# Clean Android build
yarn android:clean

# Run E2E tests
yarn e2e:build:ios     # Build for iOS testing
yarn e2e:test:ios      # Run all iOS tests
yarn e2e:test:auth     # Test auth flow only
yarn e2e:test:feed     # Test feed only
yarn e2e:test:post     # Test post creation
yarn e2e:test:profile  # Test profile
```

### Testing

```bash
# API tests (from root)
yarn test

# With UI
yarn test:ui

# With coverage
yarn test:coverage

# Mobile E2E tests
cd frontend/mobile_client
yarn e2e:test:all      # Run all tests with screenshots
```

## Architecture

### Monorepo Structure (Yarn Workspaces)

```
/
├── packages/                    # Shared libraries
│   ├── shared-types/           # TypeScript type definitions (platform-agnostic)
│   ├── shared-api-controllers/ # API client controllers (isomorphic)
│   ├── server-base/            # Server infrastructure (Fastify, MongoDB, PostgreSQL)
│   └── server-services/        # Shared backend services and models
├── backend/                    # Microservices
│   ├── api-gateway/           # NGINX-based API gateway
│   ├── ziririt-auth-service/  # Authentication & JWT
│   ├── ziririt-profile-service/ # User profiles & journeys
│   ├── ziririt-post-service/  # Posts, comments, likes
│   └── ziririt-feed-service/  # Feed generation & caching
├── frontend/
│   └── mobile_client/         # React Native Expo app
├── deploy/
│   └── local/                # Docker Compose configurations
│       ├── docker-compose.yml
│       └── local.env         # BASE_ENV_JSON configuration
└── test/
    └── api-tests/           # API integration tests
```

### Key Technologies

- **Backend**: Node.js 22+, TypeScript, Fastify, tsup for building
- **Mobile**: React Native (Expo), React Navigation, Firebase Auth
- **Databases**: PostgreSQL (users/profiles), MongoDB (posts/feed), Redis (caching)
- **Testing**: Vitest (API), Detox (E2E mobile)
- **Infrastructure**: Docker, PM2, future GCP deployment

### Environment Configuration

Backend services use a single `BASE_ENV_JSON` in `/deploy/local/local.env`:
- All services share the same base configuration
- Docker Compose overrides `SERVICE_NAME` and `PORT` per service
- Services use `@base/server-base/utils/getBaseEnvironment()` to parse config

### Package Naming Rules

- `shared-*`: Platform-agnostic, no Node.js/browser APIs, pure TypeScript
- `server-*`: Backend-only, can use Node.js APIs and server frameworks
- `front-*`: Frontend-only, can use React/React Native APIs

## Development Workflow

### API Development

1. All API routes must start with `/api`
2. Define types in `packages/shared-types`
3. Implement controllers in `packages/shared-api-controllers`
4. Backend services auto-reload in Docker (tsup watches files)
5. Inter-service communication through shared controllers

### Mobile Development

1. All API calls through `@base/shared-api-controllers`
2. Firebase configuration in `src/config/firebase.config.ts`
3. Auth context manages user state
4. E2E tests required for new features

### Testing Requirements

- API tests in `./test/api-tests/` for backend features
- E2E tests in `frontend/mobile_client/e2e_test/` for mobile features
- Use shared controllers for API testing
- Include performance validation in tests

## Critical Rules

### Backend Services
- Must compile TypeScript to JavaScript using tsup
- PM2 runs compiled JavaScript from `dist/index.js`
- Use `noExternal: [/@base\/.+$/]` in tsup config to bundle dependencies
- Follow patterns in `backend/service-boilerplate`

### Frontend Development
- Component-first approach when implementing screens
- Always include loading states and error handling
- Use TypeScript interfaces for all props
- Follow existing navigation and styling patterns

### Code Style
- TypeScript throughout with strict typing
- Functional components in React Native
- Domain-driven design for backend services
- Progressive implementation approach

## Plans & Guidelines

Always check before implementation:
- `./plans/requirements.md` - Overall project goals
- `./plans/versions/` - Version-specific plans
- `./plans/implementations/` - Detailed implementation plans
- `./guidelines/project_structure.md` - Architecture rules
- `./guidelines/code_review_guideline.md` - Code review standards
