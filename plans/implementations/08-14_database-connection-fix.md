# Fix Database Connection Error in Auth Service
Date: 2025-08-14

## Issue Description
The auth service was failing to connect to the PostgreSQL database with the following error:
```
Database health check failed: AggregateError
Error: connect ECONNREFUSED ::1:5432
Error: connect ECONNREFUSED 127.0.0.1:5432
```

The service was trying to connect to localhost instead of the Docker container network.

## Root Causes

### 1. Incorrect Docker Network Hostname
- **Problem**: DATABASE_URL in local.env used `ziririt-postgres` as hostname
- **Issue**: Docker services are accessible by their service name, not container name
- **Service name**: `postgres` (defined in docker-compose.yml)
- **Container name**: `ziririt-postgres` (container_name property)

### 2. Services Not Using BASE_ENV_JSON
- **Problem**: Backend services were using `process.env.DATABASE_URL` directly
- **Issue**: Environment variables are now stored in BASE_ENV_JSON as a JSON string
- **Impact**: Services couldn't read the configuration properly

## Solution Implemented

### 1. Fixed DATABASE_URL in local.env
Changed from:
```json
"DATABASE_URL": "postgresql://ziririt_user:ziririt_password@ziririt-postgres:5432/ziririt_db"
```
To:
```json
"DATABASE_URL": "postgresql://ziririt_user:ziririt_password@postgres:5432/ziririt_db"
```

### 2. Updated All Service Configurations

#### Auth Service (`/backend/ziririt-auth-service/src/configs/app.config.mts`)
- Added import: `import { getServiceEnvironment } from '@base/server-base'`
- Changed to use: `const env = getServiceEnvironment('ziririt-auth-service')`
- Now reads configuration from parsed BASE_ENV_JSON

#### Profile Service (`/backend/ziririt-profile-service/src/configs/app.config.mts`)
- Same pattern as auth service
- Uses: `getServiceEnvironment('ziririt-profile-service')`

#### Post Service (`/backend/ziririt-post-service/src/configs/app.config.mts`)
- Same pattern, but uses MongoDB URL
- Uses: `getServiceEnvironment('ziririt-post-service')`

#### Feed Service (`/backend/ziririt-feed-service/src/configs/app.config.mts`)
- Same pattern, uses both MongoDB and Redis URLs
- Uses: `getServiceEnvironment('ziririt-feed-service')`

## Architecture Context

### Environment Configuration Flow
1. Docker compose loads `local.env` file
2. Services receive BASE_ENV_JSON as environment variable
3. `getServiceEnvironment()` parses BASE_ENV_JSON
4. Service-specific configuration is extracted
5. Services use typed configuration objects

### Benefits of This Approach
- **Centralized Configuration**: All config in one place
- **Type Safety**: TypeScript types from `@base/shared-types`
- **Consistency**: All services use same pattern
- **Maintainability**: Easy to update configuration

## Testing Steps

1. Restart Docker containers:
```bash
docker compose -f deploy/local/docker-compose.yml down
docker compose -f deploy/local/docker-compose.yml up --build
```

2. Verify auth service starts without database errors:
```bash
docker logs ziririt-auth-service
```

3. Test database connectivity:
```bash
docker exec -it ziririt-auth-service sh
# Inside container:
psql $DATABASE_URL -c "SELECT 1"
```

4. Verify all services are healthy:
```bash
docker ps
curl http://localhost:4101/health
curl http://localhost:4102/health
curl http://localhost:4103/health
curl http://localhost:4104/health
```

## Troubleshooting

### If services still can't connect:

1. **Check BASE_ENV_JSON is set**:
```bash
docker exec -it ziririt-auth-service sh -c 'echo $BASE_ENV_JSON'
```

2. **Verify network connectivity**:
```bash
docker exec -it ziririt-auth-service ping postgres
```

3. **Check PostgreSQL is running**:
```bash
docker ps | grep postgres
docker logs ziririt-postgres
```

4. **Verify service name in docker-compose.yml**:
- Service name (not container_name) is used for network resolution
- Should be `postgres:` not `ziririt-postgres:`

## Related Files
- `/deploy/local/local.env` - Environment configuration
- `/deploy/local/docker-compose.yml` - Docker services definition
- `/packages/server-base/src/utils/getEnvironment.mts` - Environment parser
- `/packages/shared-types/src/shared/Env.type.mts` - Environment types
- `/backend/*/src/configs/app.config.mts` - Service configurations
- `/CLAUDE.md` - Documentation of environment approach

## Lessons Learned
1. Always use service names (not container names) for Docker networking
2. Ensure all services use centralized configuration approach
3. Test database connectivity before service initialization
4. Document environment configuration patterns clearly