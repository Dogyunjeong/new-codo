# Repository Guidelines

## Project Structure & Module Organization
- Monorepo with Yarn workspaces.
- `packages/*`: shared libraries — `shared-*` (platform‑agnostic), `server-*` (Node‑only), `front-*` (frontend‑only).
- `backend/*`: microservices and gateway — `api-gateway/`, `ziririt-auth-service/`, `ziririt-profile-service/`, `ziririt-post-service/`, `ziririt-feed-service/`.
- `frontend/mobile_client`: React Native (Expo) app; Detox tests in `e2e_test/detox`.
- `deploy/local`: Docker Compose (`docker-compose.yml`, `local.env`).
- `test/api-tests`: Vitest API integration tests.

## Build, Test, and Development
- Backend (from repo root):
  - Start/Stop/Logs: `cd deploy/local && docker-compose up -d | down | logs -f [service]`
  - URLs: Gateway `http://localhost:8080`; Auth `:4101`; Profile `:4102`; Post `:4103`; Feed `:4104`.
  - Databases: PostgreSQL `:5432`, MongoDB `:27017`, Redis `:6379`.
- Mobile:
  - `cd frontend/mobile_client && yarn install`
  - iOS: `yarn ios`  Android: `yarn android`  Clean: `yarn android:clean`
  - E2E: `yarn e2e:test:all` or focused (`yarn e2e:test:auth|feed|post|profile`).
- Tests (root): `yarn test` | UI: `yarn test:ui` | Coverage: `yarn test:coverage`.

## Coding Style & Naming Conventions
- TypeScript everywhere; services use ESM (`.mts`). Build with `tsup`; PM2 runs `dist/index.js`.
- Enforce Prettier and ESLint; keep imports clean and types strict.
- API routes must start with `/api` (e.g., `/api/auth/*`, `/api/posts/*`).
- tsup: include `noExternal: [/@base\/.+$/]` where needed to bundle shared packages.
- Use `@base/shared-api-controllers` for all API calls (apps and tests).

## Testing Guidelines
- API tests live in `test/api-tests`; ensure Docker stack is running first.
- Mobile E2E live in `frontend/mobile_client/e2e_test/detox`.
- Prefer realistic flows; add E2E for new mobile features; keep coverage green via `yarn test:coverage`.

## Commit & Pull Request Guidelines
- Commits use conventional style (e.g., `feat:`, `fix:`, `chore:`) and stay focused.
- PRs include description, linked issues, screenshots (if UI), and a test plan/commands.
- Update docs when commands, routes, or configs change.

## Security & Configuration
- Single source of truth: `BASE_ENV_JSON` in `deploy/local/local.env`; parse via `@base/server-base/utils/getBaseEnvironment()`.
- No per‑service `.env`. Never commit secrets; keep keys under `deploy/keys`.
- See `/plans` and `/guidelines` for deeper architecture and review standards.
