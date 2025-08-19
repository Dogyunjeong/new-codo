# Google Sign-In Android Error Fix Plan

## Problem Summary

The Google Sign-In implementation on Android is experiencing multiple critical issues:

### Error Sequence:
1. **DEVELOPER_ERROR** - Google Sign-In configuration mismatch
2. **Mock authentication fallback** - Development mode fallback triggered
3. **Invalid token format** - JWT decoding failure
4. **Token refresh failure** - Missing method `refreshSession` in AuthController
5. **SecureStorage method errors** - Missing `clearAuthToken` and `clearRefreshToken` methods

## Root Cause Analysis

### 1. DEVELOPER_ERROR from Google Sign-In

**Issue**: SHA-1 fingerprint mismatch between debug.keystore and Google Cloud Console configuration

**Evidence**:
- `google-services.json` has OAuth client configured for package `com.codo.codo`
- Only Web Client ID is present (type 3), no Android OAuth client (type 1)
- Android app is using `debug.keystore` for signing

### 2. Missing GoogleAuthService Module

**Issue**: `GoogleAuthService` is imported but file doesn't exist

**Evidence**:
- `AuthService.ts:409` references `GoogleAuthService.signOut()`
- No `GoogleAuthService.ts` file found in the codebase
- Causes runtime errors when Google auth methods are called

### 3. AuthController Method Mismatch

**Issue**: `refreshSession` method doesn't exist in AuthController

**Evidence**:
- `TokenManager.ts:184` calls `this.authController.refreshSession()`
- `Auth.controller.mts:81` only has `refreshToken` method, not `refreshSession`

### 4. SecureStorage Missing Methods

**Issue**: `clearAuthToken` and `clearRefreshToken` methods don't exist

**Evidence**:
- `TokenManager.ts:273-274` calls these methods
- `SecureStorage.ts` only has `removeAuthToken` and `removeRefreshToken` methods

### 5. Token Format Issues

**Issue**: Mock tokens don't follow JWT format

**Evidence**:
- Mock tokens like `'mock-jwt-token-' + Date.now()` can't be decoded
- `TokenManager.decodeToken()` expects proper JWT format with three base64-encoded parts

## Fix Implementation Plan

### Phase 1: Fix Immediate Errors (Critical)

#### 1.1 Create Missing GoogleAuthService
```typescript
// Create src/services/auth/GoogleAuthService.ts
- Implement signOut() method
- Implement linkAccount() method  
- Implement unlinkAccount() method
- Handle Google Sign-In native module interactions
```

#### 1.2 Fix SecureStorage Method Names
```typescript
// Update src/services/storage/SecureStorage.ts
- Add alias methods:
  - clearAuthToken() → calls removeAuthToken()
  - clearRefreshToken() → calls removeRefreshToken()
```

#### 1.3 Fix AuthController Method Name
```typescript
// Update TokenManager.ts:184
- Change: this.authController.refreshSession()
- To: this.authController.refreshToken(refreshToken)
```

#### 1.4 Fix Mock Token Format
```typescript
// Update AuthService.ts getMockAuthResponse()
- Generate proper JWT-formatted mock tokens
- Include valid exp, iat, userId fields
```

### Phase 2: Fix Google Sign-In Configuration

#### 2.1 Generate and Register SHA-1 Fingerprints
```bash
# Get debug keystore SHA-1
cd android
./gradlew signingReport

# Register in Google Cloud Console:
1. Go to https://console.cloud.google.com
2. Select project: codo-dev-469003
3. APIs & Services → Credentials
4. Create OAuth 2.0 Client ID (Android)
5. Add package name: com.codo.codo
6. Add SHA-1 fingerprint from debug.keystore
```

#### 2.2 Update google-services.json
```json
// Download updated google-services.json from Firebase Console
// Should include oauth_client with client_type: 1 (Android)
```

#### 2.3 Configure Backend to Accept Firebase Tokens
```typescript
// Verify backend endpoint exists at /auth/verify
// Should accept Firebase ID tokens and return JWT
```

### Phase 3: Environment Configuration

#### 3.1 Update .env.development
```bash
# Use actual backend URLs for Android emulator
EXPO_PUBLIC_AUTH_SERVICE_URL=http://10.0.2.2:4101  # Android emulator localhost
# Or use actual IP address for physical device
```

#### 3.2 Add Android-specific Configuration
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<!-- Add if testing with local backend -->
<application android:usesCleartextTraffic="true">
```

### Phase 4: Testing & Validation

#### 4.1 Test Google Sign-In Flow
1. Clean and rebuild Android app
2. Test Google Sign-In button
3. Verify OAuth flow completes
4. Check token exchange with backend
5. Verify token storage and refresh

#### 4.2 Test Token Management
1. Verify JWT token format
2. Test automatic token refresh
3. Test session persistence
4. Test sign-out flow

## Files to Modify

### Critical Files (Must Fix):
1. `/frontend/mobile_client/src/services/auth/GoogleAuthService.ts` - CREATE NEW
2. `/frontend/mobile_client/src/services/storage/SecureStorage.ts` - ADD METHODS
3. `/frontend/mobile_client/src/services/auth/TokenManager.ts` - FIX METHOD CALL
4. `/frontend/mobile_client/src/services/AuthService.ts` - FIX MOCK TOKENS

### Configuration Files:
1. `/frontend/mobile_client/android/app/google-services.json` - UPDATE
2. `/frontend/mobile_client/.env.development` - UPDATE URLs
3. `/frontend/mobile_client/android/app/src/main/AndroidManifest.xml` - ADD cleartext if needed

## Implementation Commands

```bash
# 1. Get SHA-1 fingerprint
cd frontend/mobile_client/android
./gradlew signingReport

# 2. Clean and rebuild
cd ..
yarn android:clean
yarn android

# 3. Test with actual device/emulator
yarn android --device

# 4. Monitor logs
adb logcat | grep -E "Google|Auth|Token"
```

## Success Criteria

1. ✅ Google Sign-In completes without DEVELOPER_ERROR
2. ✅ Firebase ID token successfully obtained
3. ✅ Backend token exchange works
4. ✅ JWT tokens properly formatted and decodable
5. ✅ Token refresh works automatically
6. ✅ SecureStorage methods work without errors
7. ✅ User can sign in, stay authenticated, and sign out

## Risk Mitigation

1. **Backup current configuration** before making changes
2. **Test in development environment** first
3. **Keep mock auth enabled** as fallback during development
4. **Document all SHA-1 fingerprints** for different environments
5. **Implement proper error handling** for auth failures

## Timeline

- **Phase 1**: 30 minutes (Fix critical runtime errors)
- **Phase 2**: 1 hour (Configure Google Sign-In properly)
- **Phase 3**: 30 minutes (Update environment configuration)
- **Phase 4**: 1 hour (Testing and validation)

**Total Estimated Time**: 3 hours

## Notes

- The package name mismatch (`com.codo.codo` vs `com.ziririt.app`) should be unified
- Consider implementing a proper auth state machine for better error handling
- Add comprehensive logging for auth flow debugging
- Consider implementing auth retry logic with exponential backoff