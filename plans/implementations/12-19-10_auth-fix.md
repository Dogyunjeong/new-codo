# Authentication Fix Plan - Backend Route Issue
**Date**: 2024-12-19 10:00
**Status**: Critical Fix Required

## Problem Summary

The mobile client is failing to authenticate with Google Sign-In due to an incorrect API endpoint path. The client is calling `/auth/verify` but the backend exposes the endpoint at `/verify` (without the `/auth` prefix).

### Error Sequence:
1. Google Sign-In succeeds on mobile client
2. Client attempts to exchange Firebase token at `/auth/verify`
3. Backend returns 404: `Route POST:/auth/verify not found`
4. Client falls back to mock authentication

## Root Cause Analysis

### Issue: API Path Mismatch

**Frontend Call** (AuthService.ts:322):
```typescript
const response = await fetch(`${getBackendConfig().authServiceUrl}/auth/verify`, {
  method: 'POST',
  // ...
});
```

**Backend Route** (auth.routes.mts:124):
```typescript
fastify.post('/verify', {
  schema: { body: verifyTokenSchema },
  handler: authHandler.verifyAndExchange.bind(authHandler),
});
```

**Actual Endpoints**:
- ❌ Client expects: `http://10.0.2.2:4101/auth/verify`
- ✅ Backend provides: `http://10.0.2.2:4101/verify`

## Solution

### Option 1: Fix Frontend (Recommended - Simplest)
Change the client to use the correct endpoint path.

**File to modify**: `/frontend/mobile_client/src/services/AuthService.ts`
- Line 322: Change `/auth/verify` to `/verify`

### Option 2: Fix Backend (Alternative)
Add `/auth` prefix to all routes in the backend.

**File to modify**: `/backend/ziririt-auth-service/src/index.mts`
- Register routes with prefix: `server.register(authRoutes, { prefix: '/auth' })`

## Implementation Steps

### Fix Frontend Path (Option 1 - Recommended)

1. **Update AuthService.ts**
   ```typescript
   // Line 322 - Change from:
   const response = await fetch(`${getBackendConfig().authServiceUrl}/auth/verify`, {
   
   // To:
   const response = await fetch(`${getBackendConfig().authServiceUrl}/verify`, {
   ```

2. **Verify All Auth Endpoints**
   The backend provides these endpoints (all without `/auth` prefix):
   - `/verify` - Verify and exchange Firebase token
   - `/exchange` - Exchange token
   - `/login` - Email login (legacy)
   - `/signup` - Email signup (legacy)
   - `/google` - Google auth (uses verify internally)
   - `/apple` - Apple auth (uses verify internally)
   - `/refresh` - Refresh token
   - `/logout` - Logout
   - `/session` - Get session
   - `/me` - Get current user
   - `/health` - Health check

3. **Test the Fix**
   ```bash
   # Restart the mobile app
   cd frontend/mobile_client
   yarn android
   
   # Test Google Sign-In flow
   # Should now successfully exchange token with backend
   ```

## Testing Verification

### Manual Test Steps:
1. Clean and rebuild Android app
2. Launch app on emulator
3. Click Google Sign-In button
4. Complete Google authentication
5. Verify successful token exchange (no 404 error)
6. Confirm user is logged in

### API Test:
```bash
# Test that the endpoint works
curl -X POST http://localhost:4101/verify \
  -H "Content-Type: application/json" \
  -d '{"idToken": "<valid-firebase-token>"}'
```

## Files to Modify

### Critical Fix:
- `/frontend/mobile_client/src/services/AuthService.ts` - Line 322

### Optional Updates (for consistency):
- Review all API controller calls in `@packages/shared-api-controllers/src/Auth.controller.mts`
- Ensure they match the backend routes (no `/auth` prefix)

## Success Criteria

✅ Google Sign-In completes without 404 error
✅ Firebase token successfully exchanges for backend JWT
✅ User session is established
✅ No fallback to mock authentication
✅ Token refresh works correctly

## Risk Assessment

**Low Risk**: This is a simple path correction with no logic changes.
- Only affects the API endpoint path
- Backend is already working correctly
- Easy to rollback if needed

## Timeline

- **Immediate Fix**: 5 minutes
- **Testing**: 10 minutes
- **Total**: 15 minutes

## Notes

- The backend intentionally doesn't use `/auth` prefix to keep routes simple
- All auth-related endpoints are at the root level
- This is consistent with the service being dedicated to authentication
- Consider documenting the API endpoints for future reference