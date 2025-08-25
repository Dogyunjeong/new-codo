# Authentication Implementation Plan for Mobile Client with GCP Identity Platform

**Created**: 2025-08-12  
**Status**: Completed  
**Phase**: 1F - React Native Frontend Implementation  
**Completed**: 2025-08-13

## Executive Summary

This document outlines the complete authentication implementation strategy for the Ziririt mobile client using GCP Identity Platform (Firebase Authentication) for OAuth providers while maintaining support for email/password authentication. The implementation focuses on security, maintainability, and seamless user experience across iOS and Android platforms.

## Related Documents

- [GCP Identity Platform Implementation Plan](./phase1/auth-service-gcp-implementation.md) - Detailed plan for backend and mobile client integration with GCP Identity Platform

## Architecture Overview

### Authentication Flow
```
Mobile Client → Firebase Auth → Backend Auth Service → JWT Token → Secured APIs
```

### Technology Stack
- **Frontend**: React Native + Expo
- **OAuth Providers**: Google Sign-In, Apple Sign-In via Firebase Auth
- **Backend**: Fastify + Firebase Admin SDK
- **Token Management**: JWT with refresh token rotation
- **Secure Storage**: Expo SecureStore with encryption
- **Environment Management**: GCP Secret Manager + Expo Constants

## Implementation Phases

### Phase 1: GCP Identity Platform Setup

#### 1.1 Firebase Project Configuration
```yaml
Project Setup:
  - Link to existing GCP project: ziririt-prod
  - Enable Authentication service
  - Configure sign-in methods:
    - Email/Password: Enabled
    - Google: Enabled with OAuth 2.0
    - Apple: Enabled with Service ID
  - Set authorized domains:
    - localhost (development)
    - ziririt.com (production)
    - *.ziririt.com (subdomains)
```

#### 1.2 OAuth Provider Configuration

**Google Sign-In Setup:**
```json
{
  "web_client_id": "PROJECT_ID.apps.googleusercontent.com",
  "ios_client_id": "PROJECT_ID.apps.googleusercontent.com",
  "android_client_id": "PROJECT_ID.apps.googleusercontent.com",
  "ios_bundle_id": "com.ziririt.app",
  "android_package_name": "com.ziririt.app",
  "sha1_fingerprints": ["XX:XX:XX:XX:XX:XX:XX:XX:XX:XX"]
}
```

**Apple Sign-In Setup:**
```json
{
  "service_id": "com.ziririt.app.signin",
  "team_id": "XXXXXXXXXX",
  "key_id": "XXXXXXXXXX",
  "private_key_path": "/secrets/apple-signin.p8",
  "redirect_url": "https://auth.ziririt.com/callbacks/apple"
}
```

#### 1.3 Environment Configuration Structure

**Development Environment:**
```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyDevelopment-XXXXXXXXXXXXX
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=ziririt-dev.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=ziririt-dev
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=ziririt-dev.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:ios:abcdef123456

# OAuth Client IDs
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=123456789012-dev.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=123456789012-ios.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=123456789012-android.apps.googleusercontent.com
EXPO_PUBLIC_APPLE_SERVICE_ID=com.ziririt.app.signin.dev

# Backend Service URLs
EXPO_PUBLIC_AUTH_SERVICE_URL=http://localhost:4101
EXPO_PUBLIC_PROFILE_SERVICE_URL=http://localhost:4102
EXPO_PUBLIC_POST_SERVICE_URL=http://localhost:4103
EXPO_PUBLIC_FEED_SERVICE_URL=http://localhost:4104
```

### Phase 2: Backend Integration

#### 2.1 Firebase Admin SDK Integration

**Install Dependencies:**
```bash
cd backend/ziririt-auth-service
yarn add firebase-admin
```

**Firebase Auth Service Implementation:**
```typescript
// backend/ziririt-auth-service/src/api/auth/FirebaseAuth.service.mts
import * as admin from 'firebase-admin';
import { getAppConfig } from '../../configs/app.config.mts';

export class FirebaseAuthService {
  private app: admin.app.App;

  constructor() {
    const config = getAppConfig();
    this.app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebaseProjectId,
        clientEmail: config.firebaseClientEmail,
        privateKey: config.firebasePrivateKey,
      }),
    });
  }

  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    return await this.app.auth().verifyIdToken(idToken);
  }

  async createCustomToken(userId: string): Promise<string> {
    return await this.app.auth().createCustomToken(userId);
  }

  async getUserByEmail(email: string): Promise<admin.auth.UserRecord> {
    return await this.app.auth().getUserByEmail(email);
  }

  async createUser(properties: admin.auth.CreateRequest): Promise<admin.auth.UserRecord> {
    return await this.app.auth().createUser(properties);
  }
}
```

#### 2.2 Updated Auth Endpoints

```typescript
// backend/ziririt-auth-service/src/api/auth/auth.routes.mts
POST /auth/firebase/verify    // Verify Firebase ID token
POST /auth/firebase/login     // Login with Firebase token
POST /auth/link/provider      // Link auth provider to existing account
GET  /auth/providers          // Get linked providers for user
```

#### 2.3 Environment Variables for Backend

```typescript
// backend/ziririt-auth-service/src/configs/app.config.mts
export interface AppConfig {
  // Existing configs...
  
  // Firebase Configuration
  firebaseProjectId: string;
  firebaseClientEmail: string;
  firebasePrivateKey: string;
  
  // GCP Configuration
  gcpProjectId: string;
  gcpRegion: string;
  secretManagerEnabled: boolean;
}
```

### Phase 3: Mobile Client Implementation

#### 3.1 Package Dependencies

```json
// frontend/mobile_client/package.json
{
  "dependencies": {
    "@react-native-firebase/app": "^18.0.0",
    "@react-native-firebase/auth": "^18.0.0",
    "@react-native-google-signin/google-signin": "^10.0.0",
    "expo-apple-authentication": "~6.0.0",
    "expo-auth-session": "~5.0.0",
    "expo-web-browser": "~12.0.0",
    "expo-constants": "~14.0.0",
    "expo-device": "~5.0.0",
    "expo-secure-store": "~12.0.0"
  }
}
```

#### 3.2 OAuth Service Implementation

**Google Auth Service:**
```typescript
// frontend/mobile_client/src/services/auth/GoogleAuthService.ts
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getFirebaseConfig } from '../../config/firebase.config';

export class GoogleAuthService {
  static configure() {
    const config = getFirebaseConfig();
    GoogleSignin.configure({
      webClientId: config.googleWebClientId,
      iosClientId: config.googleIosClientId,
      offlineAccess: true,
    });
  }

  static async signIn(): Promise<{ idToken: string; user: any }> {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const { idToken } = await GoogleSignin.getTokens();
    return { idToken, user: userInfo.user };
  }

  static async signOut(): Promise<void> {
    await GoogleSignin.signOut();
  }
}
```

**Apple Auth Service:**
```typescript
// frontend/mobile_client/src/services/auth/AppleAuthService.ts
import * as AppleAuthentication from 'expo-apple-authentication';

export class AppleAuthService {
  static async signIn(): Promise<{ idToken: string; user: any }> {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    
    return {
      idToken: credential.identityToken!,
      user: {
        id: credential.user,
        email: credential.email,
        fullName: credential.fullName,
      },
    };
  }

  static async isAvailable(): Promise<boolean> {
    return await AppleAuthentication.isAvailableAsync();
  }
}
```

#### 3.3 Token Management

```typescript
// frontend/mobile_client/src/services/auth/TokenManager.ts
import { SecureStorage } from '../storage/SecureStorage';

export class TokenManager {
  private static refreshTimer: NodeJS.Timeout | null = null;
  private static readonly TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes

  static async scheduleTokenRefresh(expiresIn: number): Promise<void> {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const refreshTime = expiresIn - this.TOKEN_REFRESH_THRESHOLD;
    
    this.refreshTimer = setTimeout(async () => {
      await this.refreshToken();
    }, refreshTime);
  }

  static async refreshToken(): Promise<void> {
    try {
      const refreshToken = await SecureStorage.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token');

      const authService = new AuthService();
      const response = await authService.refreshToken(refreshToken);
      
      await SecureStorage.setAuthToken(response.token);
      if (response.refreshToken) {
        await SecureStorage.setRefreshToken(response.refreshToken);
      }

      // Schedule next refresh
      const payload = this.decodeToken(response.token);
      const expiresIn = (payload.exp * 1000) - Date.now();
      await this.scheduleTokenRefresh(expiresIn);
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Trigger re-authentication
      throw error;
    }
  }

  static decodeToken(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  static clearRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}
```

#### 3.4 Updated Auth Context

```typescript
// frontend/mobile_client/src/contexts/AuthContext.tsx
import { GoogleAuthService } from '../services/auth/GoogleAuthService';
import { AppleAuthService } from '../services/auth/AppleAuthService';
import { TokenManager } from '../services/auth/TokenManager';

interface AuthContextType {
  // Existing properties...
  
  // OAuth methods
  googleLogin: () => Promise<void>;
  appleLogin: () => Promise<void>;
  linkProvider: (provider: 'google' | 'apple') => Promise<void>;
  unlinkProvider: (provider: 'google' | 'apple') => Promise<void>;
  linkedProviders: string[];
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Existing code...

  const googleLogin = async () => {
    try {
      setIsLoading(true);
      const { idToken, user } = await GoogleAuthService.signIn();
      
      // Send to backend for verification and JWT generation
      const response = await authService.firebaseLogin(idToken, 'google');
      
      await handleAuthSuccess(response);
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const appleLogin = async () => {
    try {
      setIsLoading(true);
      const { idToken, user } = await AppleAuthService.signIn();
      
      // Send to backend for verification and JWT generation
      const response = await authService.firebaseLogin(idToken, 'apple');
      
      await handleAuthSuccess(response);
    } catch (error) {
      console.error('Apple login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = async (response: LoginResponse) => {
    // Store tokens
    await SecureStorage.setAuthToken(response.token);
    if (response.refreshToken) {
      await SecureStorage.setRefreshToken(response.refreshToken);
    }
    await SecureStorage.setUserData(response.user);
    
    // Set token for API calls
    authService.setAccessToken(response.token);
    
    // Schedule token refresh
    const payload = TokenManager.decodeToken(response.token);
    const expiresIn = (payload.exp * 1000) - Date.now();
    await TokenManager.scheduleTokenRefresh(expiresIn);
    
    setUser(response.user);
    setIsAuthenticated(true);
  };

  // Auto-refresh token on app foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && isAuthenticated) {
        TokenManager.refreshToken().catch(console.error);
      }
    });

    return () => subscription.remove();
  }, [isAuthenticated]);
};
```

### Phase 4: Security Implementation

#### 4.1 Request Interceptor

```typescript
// frontend/mobile_client/src/services/api/RequestInterceptor.ts
export class RequestInterceptor {
  static async addAuthHeader(config: any): Promise<any> {
    const token = await SecureStorage.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }

  static async handleUnauthorized(error: any): Promise<any> {
    if (error.response?.status === 401) {
      try {
        await TokenManager.refreshToken();
        // Retry original request with new token
        const token = await SecureStorage.getAuthToken();
        error.config.headers.Authorization = `Bearer ${token}`;
        return axios(error.config);
      } catch (refreshError) {
        // Redirect to login
        NavigationService.navigate('Login');
        throw refreshError;
      }
    }
    throw error;
  }
}
```

#### 4.2 Biometric Authentication

```typescript
// frontend/mobile_client/src/services/security/BiometricAuth.ts
import * as LocalAuthentication from 'expo-local-authentication';

export class BiometricAuth {
  static async isAvailable(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  }

  static async authenticate(reason: string = 'Authenticate to access your account'): Promise<boolean> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      fallbackLabel: 'Use passcode',
      cancelLabel: 'Cancel',
    });
    return result.success;
  }

  static async protectTokenAccess(): Promise<string | null> {
    const isAuthenticated = await this.authenticate();
    if (isAuthenticated) {
      return await SecureStorage.getAuthToken();
    }
    return null;
  }
}
```

### Phase 5: UI Implementation

#### 5.1 Updated Login Screen

```typescript
// frontend/mobile_client/src/screens/auth/LoginScreen.tsx
import { GoogleAuthService } from '../../services/auth/GoogleAuthService';
import { AppleAuthService } from '../../services/auth/AppleAuthService';

export const LoginScreen: React.FC = () => {
  const { login, googleLogin, appleLogin } = useAuth();
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);

  useEffect(() => {
    // Configure Google Sign-In
    GoogleAuthService.configure();
    
    // Check Apple Sign-In availability (iOS only)
    AppleAuthService.isAvailable().then(setIsAppleAvailable);
  }, []);

  return (
    <View style={styles.container}>
      {/* Email/Password Form */}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign In" onPress={() => login(email, password)} />
      
      <View style={styles.divider}>
        <Text>OR</Text>
      </View>
      
      {/* OAuth Buttons */}
      <TouchableOpacity style={styles.googleButton} onPress={googleLogin}>
        <Image source={require('../../assets/google-icon.png')} />
        <Text>Continue with Google</Text>
      </TouchableOpacity>
      
      {isAppleAvailable && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={5}
          style={styles.appleButton}
          onPress={appleLogin}
        />
      )}
    </View>
  );
};
```

### Phase 6: Testing Strategy

#### 6.1 Unit Tests

```typescript
// frontend/mobile_client/__tests__/auth/TokenManager.test.ts
describe('TokenManager', () => {
  it('should decode JWT token correctly', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
    const decoded = TokenManager.decodeToken(token);
    expect(decoded.userId).toBeDefined();
    expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
  });

  it('should schedule token refresh before expiry', async () => {
    const expiresIn = 15 * 60 * 1000; // 15 minutes
    await TokenManager.scheduleTokenRefresh(expiresIn);
    // Verify timer is set for 10 minutes (15 - 5 threshold)
  });
});
```

#### 6.2 Integration Tests

```typescript
// frontend/mobile_client/__tests__/auth/AuthFlow.integration.test.ts
describe('Authentication Flow', () => {
  it('should complete Google sign-in flow', async () => {
    // Mock Google Sign-In
    jest.spyOn(GoogleAuthService, 'signIn').mockResolvedValue({
      idToken: 'mock-google-token',
      user: { email: 'test@gmail.com' }
    });

    // Test auth flow
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.googleLogin();
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('test@gmail.com');
  });
});
```

### Phase 7: Environment Management

#### 7.1 Configuration Loader

```typescript
// frontend/mobile_client/src/config/app.config.ts
import Constants from 'expo-constants';

interface AppConfig {
  environment: 'development' | 'staging' | 'production';
  firebase: FirebaseConfig;
  oauth: OAuthConfig;
  backend: BackendConfig;
}

export const getAppConfig = (): AppConfig => {
  const env = Constants.expoConfig?.extra?.environment || 'development';
  
  return {
    environment: env,
    firebase: getFirebaseConfig(env),
    oauth: getOAuthConfig(env),
    backend: getBackendConfig(env),
  };
};

const getFirebaseConfig = (env: string): FirebaseConfig => {
  switch (env) {
    case 'production':
      return {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY_PROD,
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN_PROD,
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID_PROD,
        // ...
      };
    case 'staging':
      return {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY_STAGING,
        // ...
      };
    default:
      return {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY_DEV,
        // ...
      };
  }
};
```

#### 7.2 App Configuration (app.json)

```json
// frontend/mobile_client/app.json
{
  "expo": {
    "name": "Ziririt",
    "slug": "ziririt",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.ziririt.app",
      "usesAppleSignIn": true,
      "config": {
        "googleSignIn": {
          "reservedClientId": "com.googleusercontent.apps.xxx"
        }
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.ziririt.app",
      "googleServicesFile": "./google-services.json"
    },
    "extra": {
      "environment": "${ENVIRONMENT}",
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

## Security Considerations

### 1. Token Security
- JWT tokens expire in 15 minutes
- Refresh tokens rotate on each use
- Tokens stored in encrypted secure storage
- Biometric authentication for sensitive operations

### 2. Network Security
- Certificate pinning in production
- Request signing for API calls
- HTTPS enforced for all communications
- App Transport Security enabled on iOS

### 3. OAuth Security
- PKCE (Proof Key for Code Exchange) for OAuth flows
- State parameter validation
- Nonce validation for ID tokens
- Redirect URL validation

### 4. Data Protection
- PII encrypted at rest
- Secure key generation
- Keychain/Keystore integration
- Memory protection for sensitive data

## Monitoring & Analytics

### 1. Authentication Metrics
- Login success/failure rates
- OAuth provider usage
- Token refresh patterns
- Session duration

### 2. Error Tracking
- Authentication errors
- Token refresh failures
- Network errors
- Provider-specific issues

### 3. Performance Monitoring
- Login flow duration
- Token refresh latency
- API response times
- App startup time

## Rollout Strategy

### Phase 1: Development Testing
- Internal testing with test accounts
- OAuth provider sandbox testing
- Token refresh scenarios
- Error handling validation

### Phase 2: Beta Testing
- Limited rollout to beta users
- A/B testing OAuth vs email/password
- Performance monitoring
- Feedback collection

### Phase 3: Production Release
- Gradual rollout (10% → 50% → 100%)
- Real-time monitoring
- Quick rollback capability
- Support documentation

## Success Metrics

### Technical Metrics
- ✅ Authentication success rate > 99%
- ✅ Token refresh success rate > 99.5%
- ✅ Login flow completion < 3 seconds
- ✅ Zero security vulnerabilities

### User Experience Metrics
- ✅ Login conversion rate > 80%
- ✅ OAuth adoption rate > 60%
- ✅ Session retention > 7 days
- ✅ Support tickets < 1% of users

## Troubleshooting Guide

### Common Issues

1. **Google Sign-In not working**
   - Verify SHA-1 fingerprint configuration
   - Check bundle ID matches configuration
   - Ensure web client ID is correct

2. **Apple Sign-In not available**
   - Verify capability is enabled in Xcode
   - Check provisioning profile includes Sign in with Apple
   - Ensure service ID is configured

3. **Token refresh failing**
   - Check refresh token hasn't expired
   - Verify backend service is accessible
   - Ensure secure storage isn't corrupted

4. **Firebase token verification failing**
   - Verify Firebase project configuration
   - Check service account credentials
   - Ensure token hasn't been tampered with

## Dependencies & Requirements

### Mobile Client
- React Native 0.72+
- Expo SDK 49+
- iOS 13.0+ (for Apple Sign-In)
- Android 5.0+ (API 21+)

### Backend
- Node.js 18+
- Fastify 4+
- Firebase Admin SDK 11+
- PostgreSQL 14+

### External Services
- GCP Identity Platform (Firebase Auth)
- Apple Developer Account (for Apple Sign-In)
- Google Cloud Console (for OAuth setup)

## References

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Google Sign-In for React Native](https://github.com/react-native-google-signin/google-signin)
- [Sign in with Apple](https://developer.apple.com/sign-in-with-apple/)
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## Appendix

### A. Sample Environment Files

See `/frontend/mobile_client/.env.example` for complete environment variable templates.

### B. Migration Guide

For existing users migrating from email/password to OAuth:
1. User logs in with email/password
2. Prompt to link Google/Apple account
3. Complete OAuth flow
4. Link provider to existing account
5. Future logins can use either method

### C. Compliance Considerations

- GDPR: User consent for data processing
- CCPA: California privacy requirements
- COPPA: Age verification for users under 13
- App Store: Apple Sign-In required if offering third-party OAuth

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-08-12  
**Next Review**: 2025-09-12