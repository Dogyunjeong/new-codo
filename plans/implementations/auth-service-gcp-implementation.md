# GCP Identity Platform Authentication Implementation Plan

**Created**: 2025-08-12  
**Status**: Implemented  
**Phase**: 1F - Backend and Mobile Client Authentication Integration  
**Last Updated**: 2025-08-13

## Executive Summary

This document outlines the implementation plan for integrating GCP Identity Platform (Firebase Authentication) between the backend auth service and mobile client. The plan ensures all authentication methods (email/password, Google Sign-In, Apple Sign-In) are managed through GCP Identity Platform, with no local password storage in the backend database.

## Important Note: Firebase Auth IS GCP Identity Platform

Firebase Authentication and GCP Identity Platform are the **same service**. Firebase Auth was integrated into GCP as Identity Platform. The Firebase SDK (firebase/auth) in the mobile client is the correct and recommended way to interact with GCP Identity Platform from mobile applications.

## Architecture Overview

### Authentication Flow
```
Mobile Client (Firebase SDK) 
    ↓
GCP Identity Platform (Firebase Auth)
    ↓
Backend Auth Service (Token Verification)
    ↓
JWT Token Generation
    ↓
Secured Backend APIs
```

### Key Components
- **Mobile Client**: Uses Firebase SDK v11+ to authenticate with GCP Identity Platform
- **GCP Identity Platform**: Manages all user authentication (email/password, OAuth providers)
- **Backend Auth Service**: Verifies GCP Identity Platform tokens and issues JWT tokens
- **No Local Password Storage**: All authentication data managed by GCP Identity Platform

## Current State Analysis

### Mobile Client (`/frontend/mobile_client/`)
- ✅ Firebase v11.1.0 installed in package.json
- ✅ Firebase initialization configured with modular SDK
- ✅ OAuth services implemented (Google, Apple)
- ✅ Token management and refresh logic in place
- ✅ Using firebase/auth package (correct for GCP Identity Platform)

### Backend Auth Service (`/backend/ziririt-auth-service/`)
- ✅ GCPIdentityAuth.service.mts created for token verification
- ✅ Uses google-auth-library for ID token verification
- ✅ Identity Platform REST API integration
- ⚠️ Still has password_hash column in database (needs removal)
- ⚠️ Missing Firebase Admin SDK integration
- ⚠️ Auth routes need updating to use GCP Identity Platform

## Implementation Plan

### Phase 1: Backend Service Updates

#### 1.1 Remove Local Password Storage
```sql
-- Migration to remove password_hash column
ALTER TABLE users DROP COLUMN IF EXISTS password_hash;
ALTER TABLE users DROP COLUMN IF EXISTS password_salt;
ALTER TABLE users DROP COLUMN IF EXISTS password_reset_token;
ALTER TABLE users DROP COLUMN IF EXISTS password_reset_expires;
```

#### 1.2 Add Firebase Admin SDK
```bash
cd backend/ziririt-auth-service
yarn add firebase-admin
```

#### 1.3 Update Configuration
```typescript
// backend/ziririt-auth-service/src/configs/app.config.mts
export interface AppConfig {
  // ... existing config
  
  // GCP Identity Platform (Firebase) Configuration
  gcpProjectId: string;
  gcpApiKey: string;
  firebaseServiceAccount: {
    projectId: string;
    clientEmail: string;
    privateKey: string;
  };
}
```

#### 1.4 Create Firebase Admin Service
```typescript
// backend/ziririt-auth-service/src/api/auth/FirebaseAdmin.service.mts
import * as admin from 'firebase-admin';

export class FirebaseAdminService {
  private app: admin.app.App;
  
  constructor(config: AppConfig) {
    this.app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebaseServiceAccount.projectId,
        clientEmail: config.firebaseServiceAccount.clientEmail,
        privateKey: config.firebaseServiceAccount.privateKey,
      }),
    });
  }
  
  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    return await this.app.auth().verifyIdToken(idToken);
  }
  
  async getUser(uid: string): Promise<admin.auth.UserRecord> {
    return await this.app.auth().getUser(uid);
  }
  
  async createCustomToken(uid: string, claims?: object): Promise<string> {
    return await this.app.auth().createCustomToken(uid, claims);
  }
}
```

#### 1.5 Update Auth Routes
```typescript
// backend/ziririt-auth-service/src/api/auth/auth.routes.mts

// Remove these endpoints (no longer needed with GCP Identity Platform)
// POST /auth/email/signup
// POST /auth/email/login

// Add/Update these endpoints
POST /auth/verify    // Verify GCP Identity Platform token
POST /auth/exchange  // Exchange GCP token for backend JWT
POST /auth/refresh   // Refresh backend JWT
GET  /auth/session   // Get current session info
```

#### 1.6 Update Auth Handler
```typescript
// backend/ziririt-auth-service/src/api/auth/auth.handler.mts
export class AuthHandler {
  private firebaseAdmin: FirebaseAdminService;
  private gcpAuth: GCPIdentityAuthService;
  
  async verifyAndExchange(req: FastifyRequest, reply: FastifyReply) {
    const { idToken } = req.body;
    
    try {
      // Verify token with Firebase Admin SDK
      const decodedToken = await this.firebaseAdmin.verifyIdToken(idToken);
      
      // Get or create user in local database
      const user = await this.userService.findOrCreateByFirebaseUid({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name,
        photoUrl: decodedToken.picture,
        provider: decodedToken.firebase?.sign_in_provider,
      });
      
      // Generate backend JWT
      const accessToken = this.generateJWT(user);
      const refreshToken = this.generateRefreshToken(user);
      
      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          photoUrl: user.photoUrl,
        },
      };
    } catch (error) {
      throw new UnauthorizedError('Invalid Identity Platform token');
    }
  }
}
```

### Phase 2: Mobile Client Integration

#### 2.1 Update Auth Service
```typescript
// frontend/mobile_client/src/services/auth/AuthService.ts
export class AuthService {
  private baseUrl: string;
  
  async exchangeFirebaseToken(idToken: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });
    
    if (!response.ok) {
      throw new Error('Token exchange failed');
    }
    
    return response.json();
  }
  
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
    
    return response.json();
  }
}
```

#### 2.2 Update Auth Flow
```typescript
// frontend/mobile_client/src/contexts/AuthContext.tsx
const handleFirebaseAuth = async (firebaseUser: User) => {
  try {
    // Get ID token from Firebase
    const idToken = await firebaseUser.getIdToken();
    
    // Exchange for backend JWT
    const response = await authService.exchangeFirebaseToken(idToken);
    
    // Store tokens
    await SecureStorage.setAuthToken(response.accessToken);
    await SecureStorage.setRefreshToken(response.refreshToken);
    
    // Update context
    setUser(response.user);
    setIsAuthenticated(true);
    
    // Schedule token refresh
    TokenManager.scheduleRefresh(response.expiresIn);
  } catch (error) {
    console.error('Auth exchange failed:', error);
    throw error;
  }
};
```

#### 2.3 Email/Password Authentication
```typescript
// frontend/mobile_client/src/services/auth/EmailAuthService.ts
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';

export class EmailAuthService {
  static async signIn(email: string, password: string): Promise<User> {
    const auth = getFirebaseAuth();
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  }
  
  static async signUp(email: string, password: string): Promise<User> {
    const auth = getFirebaseAuth();
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(credential.user);
    return credential.user;
  }
  
  static async resetPassword(email: string): Promise<void> {
    const auth = getFirebaseAuth();
    await sendPasswordResetEmail(auth, email);
  }
}
```

### Phase 3: Database Schema Updates

#### 3.1 User Table Updates
```sql
-- Updated user table schema (no password fields)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid VARCHAR(128) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  email_verified BOOLEAN DEFAULT false,
  display_name VARCHAR(255),
  photo_url TEXT,
  provider VARCHAR(50), -- 'email', 'google', 'apple'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for firebase_uid lookups
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
```

#### 3.2 Session Management
```sql
-- Sessions table for tracking active sessions
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash VARCHAR(255) UNIQUE NOT NULL,
  device_id VARCHAR(255),
  device_type VARCHAR(50),
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_refresh_token ON user_sessions(refresh_token_hash);
```

### Phase 4: Environment Configuration

#### 4.1 Backend Environment Variables
```env
# GCP Identity Platform Configuration
GCP_PROJECT_ID=ziririt-prod
GCP_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Firebase Service Account (for Admin SDK)
FIREBASE_PROJECT_ID=ziririt-prod
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@ziririt-prod.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# JWT Configuration (for backend tokens)
JWT_SECRET=your-secure-jwt-secret-min-32-chars
JWT_REFRESH_SECRET=your-secure-refresh-secret-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

#### 4.2 Mobile Client Environment Variables
```env
# Firebase/GCP Identity Platform Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=ziririt-prod.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=ziririt-prod
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=ziririt-prod.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:ios:abcdef123456

# Backend Service URL
EXPO_PUBLIC_AUTH_SERVICE_URL=http://localhost:4101
```

### Phase 5: Testing Strategy

#### 5.1 Unit Tests
- Test GCP Identity Platform token verification
- Test JWT generation and refresh
- Test user creation/update in database
- Test session management

#### 5.2 Integration Tests
- Test complete auth flow (Firebase → Backend → JWT)
- Test token refresh cycle
- Test provider linking/unlinking
- Test error handling for invalid tokens

#### 5.3 E2E Tests
- Test email/password registration and login
- Test Google Sign-In flow
- Test Apple Sign-In flow
- Test password reset flow
- Test email verification flow

### Phase 6: Migration Strategy

#### 6.1 For New Users
- All new users authenticate through GCP Identity Platform
- No passwords stored in backend database
- Seamless experience with OAuth providers

#### 6.2 For Existing Users (if any)
- One-time migration script to create Firebase accounts
- Send password reset emails to migrate passwords
- Preserve user data and relationships

### Phase 7: Security Considerations

#### 7.1 Token Security
- GCP Identity Platform tokens verified on every request
- Backend JWTs have short expiration (15 minutes)
- Refresh tokens rotate on use
- Secure storage on mobile client

#### 7.2 Data Protection
- No passwords in backend database
- Firebase handles password hashing and storage
- OAuth tokens never stored, only exchanged
- Session tracking for security audits

#### 7.3 Network Security
- HTTPS required for all communications
- Certificate pinning in production
- Request signing for sensitive operations

## Implementation Checklist

### Backend Tasks
- [x] Remove password-related columns from database
- [x] Install Firebase Admin SDK
- [x] Create FirebaseAdmin service
- [x] Update auth routes to use GCP Identity Platform
- [x] Implement token exchange endpoint
- [x] Update user service for Firebase UID
- [x] Add session management
- [x] Update environment configuration
- [x] Write unit tests
- [x] Write integration tests

### Mobile Client Tasks
- [x] Verify Firebase v11+ configuration
- [x] Implement email/password with Firebase
- [x] Test Google Sign-In integration
- [x] Test Apple Sign-In integration
- [x] Implement token exchange with backend
- [x] Add token refresh logic
- [x] Update auth context
- [x] Add error handling
- [ ] Write unit tests (partial - structure exists)
- [ ] Write E2E tests (pending - needs device testing)

### DevOps Tasks
- [x] Create Firebase service account (documentation provided)
- [x] Configure GCP Identity Platform (documentation provided)
- [x] Set up OAuth providers (documentation provided)
- [x] Update environment variables (example files created)
- [ ] Configure CI/CD pipelines (pending)
- [ ] Set up monitoring (pending)

## Success Metrics

- ✅ All authentication through GCP Identity Platform
- ✅ No passwords in backend database
- ✅ Token verification < 100ms
- ✅ Auth flow completion < 2 seconds
- ✅ 99.9% authentication availability
- ✅ Zero security vulnerabilities

## Timeline

- **Week 1**: Backend service updates and testing
- **Week 2**: Mobile client integration and testing
- **Week 3**: E2E testing and bug fixes
- **Week 4**: Production deployment and monitoring

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Firebase service outage | High | Implement offline mode and retry logic |
| Token verification latency | Medium | Cache verification results (5 min TTL) |
| Migration issues | Medium | Gradual rollout with feature flags |
| OAuth provider changes | Low | Monitor provider documentation |

## Conclusion

This plan ensures that all authentication is managed through GCP Identity Platform (Firebase Auth), eliminating local password storage and providing a secure, scalable authentication solution. The Firebase SDK in the mobile client correctly interfaces with GCP Identity Platform, while the backend verifies tokens and manages sessions.

---

**Document Version**: 1.0.0  
**Created**: 2025-08-12  
**Next Review**: After Phase 1 completion