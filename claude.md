# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ziririt - Journey sharing app with microservices backend, React web client, and React Native mobile client. Monorepo using Yarn workspaces.

## Commands

### Development Setup

```bash
# Option 1: All services (microservices mode)
cd deploy/local && docker-compose up -d

# Option 2: Mono service (single server, lighter for local dev)
cd deploy/local && docker-compose -f docker-compose.mono.yml up -d

# Start mobile client
yarn workspace mobile_client start

# Services (microservices mode):
# - API Gateway: http://localhost:8080
# - Auth Service: http://localhost:4101
# - Profile Service: http://localhost:4102
# - Post Service: http://localhost:4103
# - Feed Service: http://localhost:4104

# Services (mono mode):
# - Mono Service: http://localhost:4100 (all routes)

# Databases:
# - PostgreSQL: localhost:5432
# - MongoDB: localhost:27017
# - Redis: localhost:6379
```

### Build Commands

```bash
# Backend (builds automatically in Docker with hot reload via tsup watch)
yarn workspace [service-name] build  # Manual build if needed
yarn workspace ziririt-mono-service build  # Build mono service

# Frontend
yarn workspace wjl-client build
```

### Testing

```bash
yarn test  # Runs tests in ./test/api-tests/

# Test files use *.test.mts extension
# API tests: ./test/api-tests/
# E2E tests: ./test/e2e/
```

## Architecture

### Monorepo Structure

```
/
├── packages/                    # Shared libraries
│   ├── shared-types             # Platform-agnostic type definitions
│   ├── shared-utils             # Platform-agnostic utilities
│   ├── shared-domains           # Domain models
│   ├── shared-api-controllers   # API client controllers (isomorphic)
│   ├── server-base              # Server infrastructure (Fastify, middleware)
│   └── server-services          # Backend services (DB connections, JWT, etc.)
├── backend/                     # Microservices
│   ├── ziririt-auth-service     # Auth & OAuth (PostgreSQL)
│   ├── ziririt-profile-service  # Profiles & journeys (PostgreSQL)
│   ├── ziririt-post-service     # Posts & media (MongoDB)
│   ├── ziririt-feed-service     # Feed generation (MongoDB + Redis)
│   ├── ziririt-mono-service     # Monolith aggregator (imports all routes)
│   └── api-gateway              # NGINX reverse proxy
├── frontend/
│   ├── wjl-client               # React web app
│   └── mobile_client            # React Native / Expo mobile app
└── deploy/                      # Docker configurations
    └── local/                   # Local dev (docker-compose.yml + docker-compose.mono.yml)
```

### Key Technologies

- **Backend**: Node.js 22, TypeScript, Fastify, PostgreSQL, MongoDB, Redis, Docker
- **Frontend Web**: React 19, React Router v7, Tailwind CSS, Material-UI
- **Mobile**: React Native, Expo
- **Build**: tsup (backend), Vite (frontend)

### Package Naming Rules

- `shared-*`: MUST be platform-agnostic (no Node.js/browser APIs)
- `server-*`: Backend only (Node.js, databases, frameworks)
- Frontend packages: Can use React/browser APIs

### Mono-Service Pattern

Each backend service exports routes via `src/routes/index.mts` as `{ plugin, prefix }[]`. The mono-service imports these route arrays and registers them on a single Fastify server. Services remain independently deployable.

```
service/src/routes/index.mts  →  exports RouteConfig[]
mono-service/src/index.mts    →  imports & registers all routes
```

### Environment Configuration

- Backend services use single `BASE_ENV_JSON` in `deploy/local/local.env`
- Docker overrides `SERVICE_NAME` and `PORT` per service
- `getBaseEnvironment()` / `getServiceEnvironment()` from `server-base` parse the config

## Critical Rules

### Code Generation Priority

1. Follow `./guidelines/project_structure.md`
2. Follow `./guidelines/code_review_guideline.md`
3. Implement backend and frontend together as fullstack engineer
4. All API calls through `./packages/shared-api-controllers`
5. API URLs must start with `/api`
6. Update `shared-api-controllers` when changing API routes
7. Prioritize readability and modularization
8. Create test cases in `./test`
9. Use context7 MCP for latest library references (post-2025)

### Coding Style Guidelines

**Mandatory Rules:**

- Avoid 'else' statements - use if statements to clarify logic
- Use early return pattern
- Don't use one-line if statements with return
- Always format if statements with proper spacing:
  ```typescript
  // must be empty line before
  if (statement) {
    return;
  }
  ```
- Don't use for loops when array methods or Promise methods are available
  - Use array methods: `map`, `filter`, `reduce`, `forEach`, `find`, `some`, `every`
  - Use Promise methods: `Promise.all`, `Promise.allSettled`, `BPromise.map`, `BPromise.mapSeries`

### Docker Development

- All backend services run in Docker
- Frontend/mobile runs locally (not in Docker)
- No need to restart Docker for file changes (tsup watches)
- PostgreSQL: localhost:5432 | MongoDB: localhost:27017 | Redis: localhost:6379

## Development Workflow

### Implementation Process

1. **Planning**: Check `./plans/` for requirements and implementation plans
2. **Implementation**: Implement as fullstack engineer (backend + frontend together)
3. **Code Review**: Follow `./guidelines/code_review_guideline.md`
4. **Testing**: Create test cases in `./test`

## Sub Agent Usage Patterns

### Core Principle

You (Main agent) are a fullstack engineer for most of workflow.

- researching
  - comprehensive tasks: use @agent-general-researcher
  - UI/UX related tasks: use @agent-ui-ux-designer and @agent-general-researcher for better result
- implementation
  - mainly working by yourself
  - comprehensive tasks
    - frontend comprehensive tasks: use @agent-frontend-specialist
    - backend comprehensive tasks: use @agent-backend-specialist
  - big chunk and need best high quality
    - use both of @agent-frontend-specialist and @agent-backend-specialist parallel

## Important Notes

- Always think deeply before coding
- Prefer editing existing files over creating new ones
- Only create documentation when explicitly requested

## User custom prefix

- question: just answer the prompt, **DO NOT** editing any files
