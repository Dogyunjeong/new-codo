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

# project structure

This is yarn workspace mono repo.
`./frontend` and `./backend` is sharing `./packages`

## `./packages`

- `./packages/shared-types` defines entities or complex data structures which can be used in `./frontend` or `./backend`
- `./packages/shared-controllers` defines to communicate with microservices in `./backend`
- `./packages/shared-services` defines base models and base service logics for entities. Because our backend msa is for easing development

### shared controllers

This is to call api from other services or frontend.
All communication should be done with shared controllers
It will be used for test purpose too

- `./packages/shared-controllers/src/[upper-domain]/[domain].controller.mts`
  this is file to call api. host url will be passed from each service or frontend

## `./backend`

backend will be consisted with micro services. These microservices are just for easing development with separate concerns by domain levels
in the beginning, will be separated by domain levels and in the future it will be separated by concerns

backend MSA endpoints will be defined and can be used in `./packages/shared-controllers` to communicate in between frontend and services.
there is `./backend/api-gateway` to ease communications

- all backend services must meet type definitions in `./packages/shared-types`
- communicate backend endpoints with `./packages/shared-controllers`

### Service

#### Architecture

Based on onion architecture and domain driven architecture
My focusing is modularizing codes
There are base services and models which can be used in specific services.

##### Shared models and services

Theses are most primitive service and models and should be located in `./packages/shared-services`

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
          - user sign up service import `UserService` and `UserModel` from `./packages/shared-services`
      - higher level service can be existing over certain concern services.
        - `*.2nd.service.mts`, `*.3rd.service.mts`

## `./frontend`

frontend will contains all frontend services for clients or admin.

- all frontend services must meet type definitions in `./packages/shared-types`
- communicate backend endpoints with `./packages/shared-controllers`
- **IMPORTANT**: Whenever a feature is added in frontend, corresponding e2e test codes MUST be added

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
- Use shared controllers from `@base/shared-controllers` for most API testing
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
