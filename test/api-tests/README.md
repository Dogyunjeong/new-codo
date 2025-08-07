# Ziririt API Test Suite

Comprehensive API testing for the domain-driven microservices architecture using Vitest and shared-controllers.

## Overview

This test suite validates the refactored domain-driven architecture with:
- **Auth Service**: OAuth & Authentication domains
- **Profile Service**: Profile, Goal & Social domains  
- **Post Service**: Post, Media & Interaction domains

## Test Structure

```
test/
├── api/
│   ├── controllers/          # Individual service controller tests
│   │   ├── AuthController.test.ts
│   │   ├── ProfileController.test.ts
│   │   └── PostController.test.ts
│   └── integration/          # Cross-service integration tests
│       ├── CrossService.test.ts
│       └── DomainArchitecture.test.ts
├── setup.ts                  # Test configuration and setup
├── vitest.config.ts         # Vitest configuration
└── package.json             # Test dependencies
```

## Features

### 🏗️ Domain-Driven Testing
- Tests each service's domain boundaries
- Validates concern separation
- Ensures onion architecture principles

### 🔗 Integration Testing
- Cross-service data consistency
- Service communication patterns
- Domain relationship validation

### 📊 Comprehensive Coverage
- Service health checks
- Error handling validation
- Configuration flexibility
- Architecture pattern compliance

## Running Tests

### Prerequisites
Ensure all services are running via Docker:
```bash
docker compose up -d
```

### Run Tests
```bash
# From project root
yarn test

# Or directly in test directory
cd test
yarn test

# With UI
yarn test:ui

# With coverage
yarn test:coverage
```

## Test Configuration

Services are configured via environment variables:
- `AUTH_SERVICE_URL` (default: http://localhost:4101)
- `PROFILE_SERVICE_URL` (default: http://localhost:4102)  
- `POST_SERVICE_URL` (default: http://localhost:4103)

## Architecture Validation

The test suite validates:

### Service Isolation
- Each service runs on dedicated port
- Domain boundaries are respected
- No cross-domain concerns

### Communication Patterns
- HTTP-based service communication
- No EventBus dependencies
- Configurable service endpoints

### Shared Infrastructure
- Consistent controller patterns
- Reusable base classes
- Dependency inversion principles

## Test Data

Tests use predefined test data:
- Test User ID: `ff249605-088b-4595-9061-1a0108b73823`
- Test Goal ID: `0d1d202d-f87d-43c0-95f4-7c6972289944`
- Test Post ID: `post_001`

## Expected Behavior

### Auth Service Tests
- ✅ OAuth domain validation (Google/Apple)
- ✅ Authentication domain (tokens, user management)
- ❌ Invalid token rejection
- ❌ Missing authentication errors

### Profile Service Tests  
- ✅ Profile domain CRUD operations
- ✅ Goal domain management
- ✅ Social domain relationships
- ❌ Non-existent resource errors

### Post Service Tests
- ✅ Post domain content management
- ✅ Media domain file handling
- ✅ Interaction domain (likes, comments)
- ❌ Invalid post/media errors

### Integration Tests
- ✅ All services healthy
- ✅ Data consistency across services
- ✅ Domain architecture compliance
- ✅ Service communication patterns