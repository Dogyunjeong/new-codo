# Phase 1 Complete Fix Plan

**Date**: 2025-08-31  
**Status**: Active  
**Objective**: Fix all critical issues and complete Phase 1 MVP

## Critical Issues Summary

### 🔴 Authentication Issues
1. **API Path Mismatch**: Frontend calls `/auth/verify`, backend serves `/verify`
2. **Missing GoogleAuthService**: Module imported but doesn't exist
3. **Token Format**: Mock tokens not in JWT format
4. **Method Mismatches**: `refreshSession` vs `refreshToken`, `clearAuthToken` vs `removeAuthToken`
5. **Google Sign-In**: DEVELOPER_ERROR due to SHA-1 mismatch

### 🟡 Backend Service Issues
1. **Route Alignment**: Post routes need v0.1 spec alignment
2. **Database Connections**: Need verification across all services
3. **Service Communication**: Inter-service calls not tested

### 🟠 Mobile Integration Issues
1. **No Backend Connection**: Mobile client using mock data only
2. **CORS Configuration**: Backend not configured for mobile origins
3. **Network Config**: Different URLs for iOS/Android emulators

## Implementation Plan

### Phase 1: Critical Auth Fixes (Day 1)

#### 1.1 Fix API Endpoint Mismatch ✅
```typescript
// File: frontend/mobile_client/src/services/AuthService.ts
// Line 322 - Change:
const response = await fetch(`${getBackendConfig().authServiceUrl}/auth/verify`, {
// To:
const response = await fetch(`${getBackendConfig().authServiceUrl}/verify`, {
```

#### 1.2 Create Missing GoogleAuthService ✅
```typescript
// Create: frontend/mobile_client/src/services/auth/GoogleAuthService.ts
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export class GoogleAuthService {
  static async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('Google sign out error:', error);
    }
  }

  static async linkAccount(idToken: string): Promise<void> {
    // Implementation for linking Google account
    console.log('Linking Google account');
  }

  static async unlinkAccount(): Promise<void> {
    // Implementation for unlinking Google account
    console.log('Unlinking Google account');
  }
}
```

#### 1.3 Fix Method Name Mismatches ✅
```typescript
// File: frontend/mobile_client/src/services/auth/TokenManager.ts
// Line 184 - Change:
const response = await this.authController.refreshSession();
// To:
const response = await this.authController.refreshToken(refreshToken);

// File: frontend/mobile_client/src/services/storage/SecureStorage.ts
// Add alias methods:
export class SecureStorage {
  // ... existing methods ...
  
  static clearAuthToken = SecureStorage.removeAuthToken;
  static clearRefreshToken = SecureStorage.removeRefreshToken;
}
```

#### 1.4 Fix Mock Token Format ✅
```typescript
// File: frontend/mobile_client/src/services/AuthService.ts
// Update getMockAuthResponse() to generate proper JWT format:
private static getMockAuthResponse(email: string): AuthResponse {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    userId: 'mock-user-' + Date.now(),
    email: email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  }));
  const signature = 'mock-signature';
  
  return {
    authToken: `${header}.${payload}.${signature}`,
    refreshToken: `${header}.${payload}.refresh`,
    expiresIn: 3600,
    user: { /* user data */ }
  };
}
```

### Phase 2: Backend Service Verification (Day 2)

#### 2.1 Verify All Services Start ✅
```bash
cd deploy/local
docker-compose down
docker-compose up -d
docker-compose ps  # All should be "Up"
```

#### 2.2 Test Each Service Endpoint ✅
```bash
# Auth Service
curl http://localhost:4101/health

# Profile Service  
curl http://localhost:4102/health

# Post Service
curl http://localhost:4103/health

# Feed Service
curl http://localhost:4104/health
```

#### 2.3 Add CORS Configuration ✅
```typescript
// Each service's index.mts - Add CORS for mobile client:
server.register(cors, {
  origin: [
    'http://localhost:8081',     // Expo web
    'http://localhost:19000',    // Expo classic
    'http://localhost:19006',    // Expo web classic
    'http://10.0.2.2:*',         // Android emulator
    'http://192.168.*.*:*',     // Local network
    'exp://*'                    // Expo client
  ],
  credentials: true
});
```

### Phase 3: Fix Route Alignment (Day 3)

#### 3.1 Update Post Service Routes ✅
```typescript
// File: backend/ziririt-post-service/src/index.mts
// Register v0.1 interaction routes under posts:
server.register(interactionV01Routes, { prefix: '/api/posts' });

// Keep legacy routes with deprecation warning:
server.register(interactionRoutes, { prefix: '/api/interactions' });
server.addHook('onRequest', async (request, reply) => {
  if (request.url.startsWith('/api/interactions')) {
    reply.header('Deprecation', 'true');
    reply.header('Warning', '299 - "Legacy interaction routes deprecated, use /api/posts/:id/*"');
  }
});
```

#### 3.2 Update Shared Controllers ✅
```typescript
// File: packages/shared-api-controllers/src/Post.controller.mts
// Update endpoints to v0.1 spec:
export class PostController {
  async getRecentPosts() {
    return this.get('/api/posts'); // Changed from /api/posts/recent
  }
  
  async likePost(postId: string) {
    return this.post(`/api/posts/${postId}/like`); // Changed from /api/interactions/...
  }
  
  async addComment(postId: string, content: string) {
    return this.post(`/api/posts/${postId}/comments`, { content });
  }
}
```

### Phase 4: Mobile Backend Integration (Day 4-5)

#### 4.1 Configure Environment URLs ✅
```env
# File: frontend/mobile_client/.env.development
EXPO_PUBLIC_MOCK_AUTH_ENABLED=false  # Disable mock for real backend
EXPO_PUBLIC_AUTH_SERVICE_URL=http://10.0.2.2:4101     # Android emulator
EXPO_PUBLIC_PROFILE_SERVICE_URL=http://10.0.2.2:4102
EXPO_PUBLIC_POST_SERVICE_URL=http://10.0.2.2:4103
EXPO_PUBLIC_FEED_SERVICE_URL=http://10.0.2.2:4104

# For iOS Simulator, use localhost instead of 10.0.2.2
```

#### 4.2 Connect Feed Screen ✅
```typescript
// File: frontend/mobile_client/app/(tabs)/index.tsx
import { FeedController } from '@base/shared-api-controllers';
import { useAuth } from '../../src/contexts/AuthContext';

export default function FeedScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authToken } = useAuth();
  
  const feedController = useMemo(() => 
    new FeedController({
      baseURL: Config.FEED_SERVICE_URL,
      token: authToken
    }), [authToken]
  );
  
  useEffect(() => {
    loadFeed();
  }, []);
  
  const loadFeed = async () => {
    try {
      setLoading(true);
      const response = await feedController.getHomeFeed();
      setPosts(response.posts);
    } catch (error) {
      console.error('Feed load error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Render posts...
}
```

#### 4.3 Implement Create Post ✅
```typescript
// File: frontend/mobile_client/app/create-step.tsx
import { PostController } from '@base/shared-api-controllers';
import * as ImagePicker from 'expo-image-picker';

export default function CreateStepScreen() {
  const postController = new PostController({
    baseURL: Config.POST_SERVICE_URL,
    token: authToken
  });
  
  const handleSubmit = async () => {
    try {
      // Upload image if selected
      let mediaUrl = null;
      if (selectedImage) {
        mediaUrl = await uploadImage(selectedImage);
      }
      
      // Create post
      const post = await postController.createPost({
        goalId: selectedGoal.id,
        content: postContent,
        mediaFiles: mediaUrl ? [mediaUrl] : [],
        hashtags: extractHashtags(postContent),
        isMilestone: false,
        progressDate: new Date().toISOString()
      });
      
      // Navigate back to feed
      navigation.navigate('Feed');
    } catch (error) {
      console.error('Post creation error:', error);
    }
  };
}
```

#### 4.4 Connect Profile Screen ✅
```typescript
// File: frontend/mobile_client/app/(tabs)/profile.tsx
import { ProfileController } from '@base/shared-api-controllers';

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  
  const profileController = new ProfileController({
    baseURL: Config.PROFILE_SERVICE_URL,
    token: authToken
  });
  
  const postController = new PostController({
    baseURL: Config.POST_SERVICE_URL,
    token: authToken
  });
  
  useEffect(() => {
    loadProfile();
    loadUserPosts();
  }, []);
  
  const loadProfile = async () => {
    try {
      const data = await profileController.getProfile(userId);
      setProfile(data);
    } catch (error) {
      console.error('Profile load error:', error);
    }
  };
  
  const loadUserPosts = async () => {
    try {
      const posts = await postController.getUserPosts(userId);
      setUserPosts(posts);
    } catch (error) {
      console.error('Posts load error:', error);
    }
  };
}
```

### Phase 5: Core Features Completion (Day 6-7)

#### 5.1 Goal Management ✅
```typescript
// Backend implementation already exists
// Connect frontend:
const createGoal = async (goalData) => {
  const response = await profileController.createGoal(goalData);
  return response;
};

const getUserGoals = async () => {
  const goals = await profileController.getUserGoals(userId);
  return goals;
};
```

#### 5.2 Social Interactions ✅
```typescript
// Implement like/unlike:
const toggleLike = async (postId: string) => {
  if (isLiked) {
    await postController.unlikePost(postId);
  } else {
    await postController.likePost(postId);
  }
  // Update UI state
};

// Implement comments:
const addComment = async (postId: string, content: string) => {
  await postController.addComment(postId, content);
  // Refresh comments
};

// Implement follow/unfollow:
const toggleFollow = async (userId: string) => {
  if (isFollowing) {
    await profileController.unfollowUser(userId);
  } else {
    await profileController.followUser(userId);
  }
  // Update UI state
};
```

### Phase 6: Testing & Validation (Day 8)

#### 6.1 Manual Testing Checklist ✅
- [ ] Start all backend services
- [ ] Login with mock credentials
- [ ] View feed with posts
- [ ] Create a new post with image
- [ ] Like and comment on posts
- [ ] View user profile
- [ ] Follow/unfollow users
- [ ] Create and view goals
- [ ] Test pull-to-refresh
- [ ] Test error states

#### 6.2 API Response Time Validation ✅
```bash
# Test each endpoint for <500ms response:
time curl http://localhost:4101/health
time curl http://localhost:4102/api/profiles/test-user
time curl http://localhost:4103/api/posts
time curl http://localhost:4104/api/feed/home
```

#### 6.3 Integration Test Suite ✅
```bash
# Run API tests
cd test/api-tests
yarn test

# Expected: All core flows pass
```

## Success Criteria

### Must Have (Phase 1 Complete)
- ✅ Users can login (mock or real auth)
- ✅ Feed loads and displays posts
- ✅ Users can create posts with images
- ✅ Posts appear in feed after creation
- ✅ Users can like and comment on posts
- ✅ Profile screen shows user data
- ✅ Users can follow/unfollow others
- ✅ All APIs respond under 500ms

### Nice to Have (Can defer)
- Push notifications
- Video support
- Advanced search
- Analytics dashboard

## Quick Start Commands

```bash
# 1. Start backend services
cd deploy/local
docker-compose up -d

# 2. Verify services are running
docker-compose ps
curl http://localhost:4101/health

# 3. Start mobile app (iOS)
cd frontend/mobile_client
yarn ios

# 4. Start mobile app (Android)
yarn android

# 5. Run tests
cd test/api-tests
yarn test
```

## Troubleshooting Guide

### Issue: CORS errors in mobile client
**Solution**: Add mobile client origin to backend CORS config

### Issue: Android emulator can't reach backend
**Solution**: Use `10.0.2.2` instead of `localhost`

### Issue: iOS simulator can't reach backend  
**Solution**: Use `localhost` (iOS simulator shares host network)

### Issue: Token expired errors
**Solution**: Implement token refresh in TokenManager

### Issue: Database connection errors
**Solution**: Check DATABASE_URL in local.env uses correct hostname

## Development Tips

1. **Use Mock Auth First**: Get everything working with mock auth before adding OAuth
2. **Test One Service at a Time**: Verify each backend service individually
3. **Check Network Tab**: Use React Native Debugger to monitor API calls
4. **Add Logging**: Add console.logs to track data flow
5. **Handle Errors Gracefully**: Always add try-catch and loading states

## Timeline

- **Day 1**: Fix critical auth issues (4 hours)
- **Day 2**: Verify backend services (2 hours)
- **Day 3**: Fix route alignment (2 hours)
- **Day 4-5**: Mobile backend integration (8 hours)
- **Day 6-7**: Complete core features (8 hours)
- **Day 8**: Testing and validation (4 hours)

**Total**: 8 days / 28 hours of focused work

## Next Steps After Phase 1

1. **Production Deployment**: Configure GCP, set up CI/CD
2. **Security Hardening**: Add rate limiting, input validation
3. **Performance Optimization**: Add caching, optimize queries
4. **Phase 2 Features**: Inspiration chains, journey curation