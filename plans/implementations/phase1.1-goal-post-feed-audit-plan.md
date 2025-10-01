# Phase 1.1 — Journey, Post, Feed API Audit & Fix Plan

## Scope & Objectives
- Audit and fix Journey (profile svc), Post (post svc), and Feed (feed svc) APIs.
- Ensure REST correctness, auth, validation, error consistency, and data integrity.
- Align routes with `/api/*` convention and gateway expectations.

## Prerequisites
- Backend stack running: `cd deploy/local && docker-compose up -d`
- Verify gateway at `http://localhost:8080` and service ports (4101–4104).
- Use `@base/shared-api-controllers` for test calls where possible.

## Work Plan (Smallest Chunks)

### A. Journeys — Backend (profile svc) + Frontend
- Backend (backend/ziririt-profile-service)
  - [x] Routes: `src/api/journey/journey.routes.mts` — paths/prefix, params, schemas, pagination.
  - [x] Handler: `src/api/journey/journey.handler.mts` — ownership checks, 400/403/404 usage, validation.
  - [x] Service: `src/api/journey/JourneyManagement.service.mts` — DB queries, transactions, race conditions, return types.
  - [x] Types: `src/types/profile.types.mts` — `CreateJourneyRequest`, `UpdateJourneyRequest` requirements match handler logic.
  - [x] Index: `src/index.mts` — register `server.register(journeyRoutes, { prefix: '/api/journeys' })`; CORS/auth order.
  - [ ] Tests: Add/adjust API tests under `test/api-tests` for journey create/read/update/delete.
- Frontend (frontend/mobile_client)
  - [x] Service: `src/services/ProfileService.ts` — journey CRUD via `@base/shared-api-controllers`, auth token injection, error handling.
  - [ ] Screens/Flows: `app/create-journey.tsx`, `app/journey.tsx`, `app/(tabs)/profile.tsx` — wire up journey list/detail/create/update/delete with loading/error states.
  - [ ] Config: `src/config/firebase.config.ts` — profile service/gateway URLs from `BASE_ENV_JSON`.
  - [ ] E2E: Add Detox for goal CRUD in `e2e_test/detox`.

### B. Posts — Backend (post svc) + Frontend
- Backend (backend/ziririt-post-service)
  - [x] Routes: `src/api/post/post.routes.mts` — CRUD endpoints, validation, `/api/posts` prefix (order static before `:postId`).
  - [x] Service: `src/api/post/PostManagement.service.mts` — enforce goal privacy via profile svc; filter results.
  - [ ] Types: `src/types/post.types.mts` — request/response shapes align with routes.
  - [x] Media: `src/api/media/media.routes.mts`, `src/api/media/MediaManagement.service.mts` — auth middleware; file type limits, cleanup on delete.
  - [ ] Interaction: `src/api/interaction/interaction.v01.routes.mts` — idempotent like/unlike, comment trees.
  - [x] Cross-service: `src/services/profile.controller.mts` — use ProfileController.getJourney to enforce journey privacy.
  - [x] Remove legacy goal routes: deleted `src/routes/goal.routes.mts` in post service.
  - [ ] Tests: Expand API tests for post CRUD, likes, comments.
- Frontend (frontend/mobile_client)
  - [ ] Service: `src/services/PostService.ts` — create/read/update/delete posts; like/comment ops; ensure auth and consistent types.
  - [ ] Screens/Flows: `app/create-step.tsx`, `app/(tabs)/journey.tsx`, `src/screens/ProfileFeedScreen.tsx` — post creation, listing, interactions with proper states.
  - [ ] Goal link: `PostService.getGoals()/createGoal()` paths align to profile svc; remove duplicates if needed.
  - [ ] E2E: Add Detox for post CRUD and interactions.

### C. Feed — Backend (feed svc) + Frontend
- Backend (backend/ziririt-feed-service)
  - [x] Routes: `src/api/feed/feed.routes.mts` — ensure correct handler import (fix `.mjs` if needed), `/api/feed/*` paths; align with v0.1 route shape (path vs auth-derived user).
  - [x] Handler: `src/api/feed/feed.handler.mts` — fix imports; preserve pagination.
  - [ ] Service: `src/api/feed/Feed.service.mts` — composition from post/profile, sorting/filtering, avoid N+1.
  - [ ] Cache: `src/api/feed/feedCache.service.mts`, `src/services/FeedCache.service.mts` — key patterns, TTL, invalidation.
  - [x] Index: `src/index.mts` — `/api` prefix registration, add auth preHandler for home/refresh.
  - [ ] Tests: Add feed endpoint tests; verify cache hit/miss paths.
- Frontend (frontend/mobile_client)
  - [x] Service: `src/services/FeedService.ts` — normalize responses (array vs `{posts}` vs `{items}`), set token before calls.
  - [ ] Screens/Flows: `app/(tabs)/index.tsx`, `app/(tabs)/discover.tsx`, `src/screens/ProfileFeedScreen.tsx` — home, explore, user feeds; refresh behavior.
  - [ ] E2E: Add Detox for feed loading and refresh flows.

## Cross-Cutting Tasks
- [ ] Auth middleware: each protected route uses Firebase/gateway auth preHandler consistently.
- [ ] Error model: consistent error payloads and status codes across services.
- [ ] API path rules: all routes start with `/api/*` and align with NGINX gateway.
- [ ] tsup/PM2: services build to `dist/index.js`; ensure `noExternal: [/@base\/.+$/]` when bundling.

## Validation
- Backend logs: `cd deploy/local && docker-compose logs -f [service]`
- Tests: `yarn test`, `yarn test:ui`, `yarn test:coverage`
- Mobile E2E (optional scope confirmation): `cd frontend/mobile_client && yarn e2e:test:all`

## Deliverables
- Fixed route/handler/service logic per domain with diffs.
- Added/updated tests covering CRUD and key flows.
- Short summary in PR linking affected files and decisions.
