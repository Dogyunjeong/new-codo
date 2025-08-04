# Phase 1 Implementation Plan: Core Foundation
**Duration**: 8 Weeks (Weeks 1-8)  
**Objective**: Build MVP with core goal tracking and social features

## Phase 1 Scope Overview

### Core Features to Deliver
- **Goal Management**: Create, edit, delete goals with privacy settings
- **Progress Posts (Steps)**: Basic posting with text and images, custom timestamps
- **User Profiles**: Display followers, steps count, goal list
- **Social Features**: Follow/unfollow users, basic likes and comments
- **Feed System**: Home feed with followed users' progress
- **Authentication**: Social login (Google, Apple) integration

### Success Criteria
- ✅ Users can register via social login
- ✅ Users can create and manage goals
- ✅ Users can post progress updates (steps) with images
- ✅ Users can follow others and see their progress in a feed
- ✅ Basic social interactions (likes, comments) work
- ✅ All APIs respond under 500ms
- ✅ React Native app works on iOS and Android

## Technical Architecture

### Microservices for Phase 1
1. **Auth Service** (PostgreSQL) - User authentication and management
2. **Profile Service** (PostgreSQL) - User profiles, goals, relationships
3. **Post Service** (MongoDB) - Progress posts, comments, likes
4. **Feed Service** (MongoDB + Redis) - Feed generation and caching

### Technology Stack
- **Frontend**: React Native + TypeScript
- **Backend**: Fastify + @packages/base-server + TypeScript  
- **Infrastructure**: GCP Cloud Run + Pulumi IaC
- **Databases**: PostgreSQL (Cloud SQL) + MongoDB (Atlas) + Redis (Memorystore)
- **Auth**: Social OAuth (Google, Apple) + JWT
- **Media**: Cloud Storage + CDN

## 8-Week Sprint Plan

## Implementation Task Structure

### Phase 1A: Local Development Environment Setup
**Local Infrastructure (Priority: High)**
- [x] Create Docker Compose configuration for local development
- [x] Setup local PostgreSQL database with Docker
- [x] Setup local MongoDB database with Docker
- [x] Setup local Redis instance with Docker
- [x] Create shared environment configuration and secrets management

### Phase 1B: Auth Service Implementation
**Auth Service Foundation (Priority: High)**
- [x] Create auth-service project structure using @packages/base-server
- [x] Setup auth-service FastifyServer with port 4101 and logging
- [x] Create PostgreSQL database schema for users table
- [x] Create PostgreSQL database schema for refresh_tokens table
- [x] Create database indexes for auth service tables
- [x] Setup database connection and migration system for auth service

**OAuth Integration (Priority: High)**
- [x] Implement GoogleOAuthService class with authenticate and refreshToken methods
- [x] Implement AppleOAuthService class with authenticate and verifyAppleToken methods
- [x] Create JWT token generation and verification utilities
- [x] Create JWTPayload and RefreshTokenPayload interfaces

**Auth API Endpoints (Priority: High)**
- [x] Implement auth API routes: POST /auth/google, POST /auth/apple
- [x] Implement auth API routes: POST /auth/refresh, POST /auth/logout
- [x] Implement auth API routes: GET /auth/verify, GET /auth/me
- [x] Test auth service locally with sample data

### Phase 1C: Profile Service Implementation ✅
**Profile Service Foundation (Priority: High)**
- [x] Create profile-service project structure using Fastify directly
- [x] Setup profile-service FastifyServer with port 4102
- [x] Create PostgreSQL database schema for profiles table
- [x] Create PostgreSQL database schema for goals table
- [x] Create PostgreSQL database schema for follows table
- [x] Create database indexes for profile service tables

**Goal Management (Priority: High)**
- [x] Implement GoalService class with CRUD operations
- [x] Implement Profile API routes: GET/PUT /profiles/:userId
- [x] Implement Profile API routes: GET /profiles/:userId/goals, followers, following

**Social System Implementation (Priority: High)**
- [x] Implement SocialService class for follow/unfollow functionality
- [x] Implement Social API routes: POST/DELETE /social/follow/:userId
- [x] Implement Social API routes: GET /social/relationship/:userId
- [x] Test profile service locally with sample data

**Privacy & Permissions (Priority: Medium)**
- [ ] Create PrivacyUtil class for content access controls
- [ ] Implement follower count updates and social stats tracking

### Phase 1D: Post Service Implementation ✅
**Post Service Setup (Priority: High)**
- [x] Create post-service project structure using Fastify directly
- [x] Setup post-service FastifyServer with port 4103 and MongoDB connection
- [x] Create MongoDB collections schema for posts, likes, comments
- [x] Create MongoDB indexes for posts, likes, and comments collections
- [x] Setup local file storage for media files (for local development)

**Media & Content (Priority: High)**
- [x] Implement MediaService class for local file upload and processing
- [x] Implement Post API routes: POST/GET/PUT/DELETE /posts
- [x] Implement Post API routes: GET /posts/goal/:goalId, POST /media/upload

**Interaction System (Priority: High)**
- [x] Implement InteractionService class for likes and comments
- [x] Implement Interaction API routes: POST/DELETE /posts/:postId/like
- [x] Implement Interaction API routes: POST /posts/:postId/comments, DELETE /comments/:commentId
- [x] Implement Interaction API routes: GET /posts/:postId/likes, GET /posts/:postId/comments
- [x] Test post service locally with sample data

**Performance Optimization (Priority: Medium)**
- [ ] Implement CacheUtil class for post caching and social stats
- [ ] Implement social stats updating for posts (likes/comments count)

### Phase 1E: Feed Service Implementation
**Feed Generation (Priority: High)**
- [ ] Create feed-service project structure using @packages/base-server
- [ ] Setup feed-service FastifyServer with port 4104 and MongoDB/Redis connections
- [ ] Implement FeedService class with generateHomeFeed and caching methods
- [ ] Implement FeedBuilder utility class for feed generation algorithms
- [ ] Implement FeedCacheService class for Redis caching strategy

**Feed API (Priority: High)**
- [ ] Implement Feed API routes: GET /feed/home, GET /feed/goal/:goalId
- [ ] Implement Feed API routes: POST /feed/refresh
- [ ] Test feed service locally with sample data and performance benchmarks

### Phase 1F: React Native Frontend Implementation
**Mobile App Foundation (Priority: High)**
- [ ] Initialize React Native project structure for frontend/app_client
- [ ] Setup React Native navigation with AppNavigator and TabNavigator
- [ ] Setup Redux Toolkit store with authSlice and feedSlice
- [ ] Implement ApiClient class for backend service communication

**Core Screens (Priority: High)**
- [ ] Create authentication screens: LoginScreen and OnboardingScreen
- [ ] Create main app screens: FeedScreen, GoalsScreen, ProfileScreen
- [ ] Create content creation screens: CreatePostScreen, CreateGoalScreen
- [ ] Implement social login integration for Google and Apple

**Mobile Features (Priority: Medium)**
- [ ] Implement camera integration for progress post creation
- [ ] Test React Native app on both iOS and Android devices
- [ ] Connect frontend to local backend services and test complete user flows

### Phase 1G: Testing & Quality Assurance
**Backend Testing (Priority: Medium)**
- [ ] Setup Jest testing framework for all backend services
- [ ] Write unit tests for auth service (target 80%+ coverage)
- [ ] Write unit tests for profile service (target 80%+ coverage)
- [ ] Write unit tests for post service (target 80%+ coverage)
- [ ] Write unit tests for feed service (target 80%+ coverage)
- [ ] Setup integration tests for API endpoints with test databases

**Frontend Testing (Priority: Medium)**
- [ ] Setup React Native Testing Library for frontend component tests
- [ ] Create E2E test scenarios for critical user flows

**Performance Testing (Priority: Medium)**
- [ ] Setup Artillery for performance testing (500ms target)
- [ ] Optimize auth service endpoints to respond under 200ms
- [ ] Optimize profile service endpoints to respond under 300ms
- [ ] Optimize post service endpoints to respond under 400ms
- [ ] Optimize feed service endpoints to respond under 500ms

### Phase 1H: Cloud Deployment & Production Setup
**Cloud Infrastructure (Priority: High)**
- [ ] Setup GCP project and enable required APIs (Cloud Run, Cloud SQL, Cloud Storage, Memorystore)
- [ ] Configure IAM roles and service accounts for GCP infrastructure
- [ ] Setup VPC network and firewall rules
- [ ] Create Pulumi infrastructure code for Cloud SQL PostgreSQL instance
- [ ] Create Pulumi infrastructure code for MongoDB Atlas cluster setup
- [ ] Create Pulumi infrastructure code for Redis Memorystore instance
- [ ] Create Pulumi infrastructure code for Cloud Storage bucket and CDN
- [ ] Create Pulumi infrastructure code for Cloud Run services configuration (4 services)
- [ ] Setup load balancer with SSL termination

**CI/CD & Production Environment (Priority: Medium)**
- [ ] Create Docker containers for each microservice
- [ ] Setup GitHub Actions CI/CD pipeline for automated deployment
- [ ] Setup environment management (dev, staging, prod)
- [ ] Deploy all services to Cloud Run and verify functionality
- [ ] Setup production monitoring and alerting

### Phase 1I: Security & Compliance
**Security Review (Priority: Medium)**
- [ ] Conduct security review of OAuth implementation and JWT handling
- [ ] Review data protection compliance and privacy controls
- [ ] Setup production security monitoring and logging

### Phase 1J: Documentation & Operations
**Documentation (Priority: Low)**
- [ ] Create API documentation for all service endpoints
- [ ] Document database schemas and relationships
- [ ] Create deployment guides for all services
- [ ] Document testing procedures and performance benchmarks

**Operations (Priority: Medium)**
- [ ] Setup comprehensive monitoring and alerting for all services
- [ ] Create operational runbooks and incident response procedures

## Week 1-2: Infrastructure & Authentication

### Week 1: Infrastructure Setup
**Objectives**: Core infrastructure and auth service foundation

#### Infrastructure (Pulumi)
- **GCP Project Setup**
  - Enable APIs: Cloud Run, Cloud SQL, Cloud Storage, Memorystore
  - Configure IAM roles and service accounts
  - Setup VPC network and firewall rules

- **Pulumi Infrastructure Code**
  ```typescript
  // infrastructure/index.ts
  - Cloud SQL PostgreSQL instance (auth + profile databases)
  - MongoDB Atlas cluster setup
  - Redis Memorystore instance
  - Cloud Storage bucket for media
  - Cloud Run services configuration (4 services)
  - Load balancer with SSL termination
  ```

- **CI/CD Pipeline**
  - GitHub Actions for automated deployment
  - Docker containers for each service
  - Environment management (dev, staging, prod)

#### Auth Service Foundation
- **Setup Base Project**
  ```typescript
  // auth-service/src/index.mts
  import { FastifyServer } from 'base-server';
  
  const server = new FastifyServer({
    port: 4101,
    logName: 'auth-service'
  });
  ```

- **Database Schema (PostgreSQL)**
  ```sql
  -- users table
  CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url VARCHAR(500),
    provider VARCHAR(20) NOT NULL, -- 'google', 'apple'
    provider_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(provider, provider_id)
  );

  -- refresh_tokens table
  CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );
  
  -- indexes
  CREATE INDEX idx_users_email ON users(email);
  CREATE INDEX idx_users_provider ON users(provider, provider_id);
  CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
  ```

**Deliverables Week 1:**
- ✅ GCP infrastructure deployed via Pulumi
- ✅ Auth service skeleton with database connection
- ✅ CI/CD pipeline operational

### Week 2: Social Authentication
**Objectives**: Complete OAuth integration and user management

#### OAuth Integration
- **Google OAuth Setup**
  ```typescript
  // auth-service/src/api/oauth/Google.service.mts
  class GoogleOAuthService {
    async authenticate(code: string): Promise<AuthResponse>
    async refreshToken(refreshToken: string): Promise<AuthResponse>
    private async verifyGoogleToken(token: string): Promise<GoogleUser>
  }
  ```

- **Apple OAuth Setup**
  ```typescript
  // auth-service/src/api/oauth/Apple.service.mts
  class AppleOAuthService {
    async authenticate(code: string): Promise<AuthResponse>
    async verifyAppleToken(token: string): Promise<AppleUser>
  }
  ```

#### Auth API Endpoints
```typescript
// auth-service/src/api/auth/Auth.routes.mts
POST /auth/google          // Google OAuth callback
POST /auth/apple           // Apple OAuth callback  
POST /auth/refresh         // Refresh JWT token
POST /auth/logout          // Revoke refresh token
GET  /auth/verify          // Verify JWT token (for other services)
GET  /auth/me              // Get current user info
```

#### JWT Implementation
- **Token Structure**
  ```typescript
  interface JWTPayload {
    userId: string;
    email: string;
    username: string;
    iat: number;
    exp: number; // 15 minutes
  }
  
  interface RefreshTokenPayload {
    userId: string;
    tokenId: string;
    iat: number;
    exp: number; // 7 days
  }
  ```

**Deliverables Week 2:**
- ✅ Google and Apple OAuth working
- ✅ JWT token generation and verification
- ✅ User registration and login complete
- ✅ Auth service deployed and tested

## Week 3-4: Profile & Goal Management

### Week 3: Profile Service Setup
**Objectives**: User profiles and basic goal management

#### Profile Service Foundation
- **Database Schema (PostgreSQL)**
  ```sql
  -- profiles table
  CREATE TABLE profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    is_private BOOLEAN DEFAULT false,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    steps_count INTEGER DEFAULT 0,
    goals_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  -- goals table
  CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT false,
    steps_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  -- follows table
  CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
  );
  
  -- indexes
  CREATE INDEX idx_goals_user ON goals(user_id);
  CREATE INDEX idx_goals_created ON goals(created_at DESC);
  CREATE INDEX idx_follows_follower ON follows(follower_id);
  CREATE INDEX idx_follows_following ON follows(following_id);
  ```

#### Profile API Endpoints
```typescript
// profile-service/src/api/profiles/Profile.routes.mts
GET    /profiles/:userId           // Get user profile
PUT    /profiles/:userId           // Update profile (own only)
GET    /profiles/:userId/goals     // Get user's goals
GET    /profiles/:userId/followers // Get followers list
GET    /profiles/:userId/following // Get following list
```

#### Goal Management
```typescript
// profile-service/src/api/goals/Goal.service.mts
class GoalService {
  async createGoal(userId: string, goalData: CreateGoalRequest): Promise<Goal>
  async getUserGoals(userId: string, viewerId?: string): Promise<Goal[]>
  async updateGoal(goalId: string, userId: string, updates: UpdateGoalRequest): Promise<Goal>
  async deleteGoal(goalId: string, userId: string): Promise<void>
  async getGoalById(goalId: string, viewerId?: string): Promise<Goal | null>
}
```

**Deliverables Week 3:**
- ✅ Profile service with database schema
- ✅ Goal CRUD operations working
- ✅ Profile API endpoints functional

### Week 4: Social Features
**Objectives**: Follow system and social relationships

#### Follow System Implementation
```typescript
// profile-service/src/api/social/Social.service.mts
class SocialService {
  async followUser(followerId: string, followingId: string): Promise<void>
  async unfollowUser(followerId: string, followingId: string): Promise<void>
  async getFollowers(userId: string, page: number): Promise<User[]>
  async getFollowing(userId: string, page: number): Promise<User[]>
  async isFollowing(followerId: string, followingId: string): Promise<boolean>
  async updateFollowCounts(userId: string): Promise<void>
}
```

#### Social API Endpoints
```typescript
// profile-service/src/api/social/Social.routes.mts
POST   /social/follow/:userId      // Follow a user
DELETE /social/follow/:userId      // Unfollow a user
GET    /social/relationship/:userId // Check relationship status
```

#### Privacy & Permissions
```typescript
// profile-service/src/utils/Privacy.util.mts
class PrivacyUtil {
  static canViewProfile(profile: Profile, viewerId?: string): boolean
  static canViewGoals(goal: Goal, viewerId?: string): boolean
  static filterPrivateContent<T>(items: T[], viewerId?: string): T[]
}
```

**Deliverables Week 4:**
- ✅ Follow/unfollow functionality
- ✅ Privacy controls working
- ✅ Profile service complete and tested

## Week 5-6: Content & Post Management

### Week 5: Post Service Foundation
**Objectives**: Progress posts (steps) creation and basic interactions

#### Post Service Setup (MongoDB)
- **Database Schema (MongoDB)**
  ```typescript
  // posts collection
  interface PostDocument {
    _id: ObjectId;
    id: string;           // UUID
    userId: string;       // User who created
    goalId: string;       // Associated goal
    content: string;      // Post content (max 500 chars)
    mediaFiles?: {
      id: string;
      url: string;
      type: 'image' | 'video';
      thumbnailUrl?: string;
    }[];
    hashtags?: string[];
    isMilestone: boolean;
    progressDate: Date;   // When progress happened
    createdAt: Date;      // When posted
    updatedAt: Date;
    
    // Cached social stats for performance
    likesCount: number;
    commentsCount: number;
  }

  // likes collection
  interface LikeDocument {
    _id: ObjectId;
    id: string;
    userId: string;
    postId: string;
    postType: 'progress_post';
    createdAt: Date;
  }

  // comments collection  
  interface CommentDocument {
    _id: ObjectId;
    id: string;
    userId: string;
    postId: string;
    postType: 'progress_post';
    content: string;
    parentCommentId?: string;
    createdAt: Date;
    updatedAt: Date;
  }
  ```

- **MongoDB Indexes**
  ```javascript
  // posts collection indexes
  db.posts.createIndex({ "userId": 1, "createdAt": -1 });
  db.posts.createIndex({ "goalId": 1, "progressDate": -1 });
  db.posts.createIndex({ "createdAt": -1 });
  db.posts.createIndex({ "hashtags": 1 });
  
  // likes collection indexes
  db.likes.createIndex({ "postId": 1 });
  db.likes.createIndex({ "userId": 1, "postId": 1 }, { unique: true });
  
  // comments collection indexes
  db.comments.createIndex({ "postId": 1, "createdAt": 1 });
  db.comments.createIndex({ "userId": 1 });
  ```

#### Media Upload System
```typescript
// post-service/src/api/media/Media.service.mts
class MediaService {
  async uploadImage(file: Buffer, userId: string): Promise<UploadedMediaFile>
  async uploadVideo(file: Buffer, userId: string): Promise<UploadedMediaFile>
  async generateThumbnail(videoUrl: string): Promise<string>
  async deleteMedia(mediaId: string, userId: string): Promise<void>
  private async compressImage(buffer: Buffer): Promise<Buffer>
}
```

#### Post API Endpoints
```typescript
// post-service/src/api/posts/Post.routes.mts
POST   /posts                     // Create progress post
GET    /posts/:postId             // Get single post
PUT    /posts/:postId             // Update post (own only)
DELETE /posts/:postId             // Delete post (own only)
GET    /posts/goal/:goalId        // Get posts for a goal
POST   /media/upload              // Upload media files
```

**Deliverables Week 5:**
- ✅ Post service with MongoDB schema
- ✅ Progress post creation working
- ✅ Media upload to Cloud Storage
- ✅ Basic post CRUD operations

### Week 6: Social Interactions
**Objectives**: Likes, comments, and social engagement

#### Social Interactions Implementation
```typescript
// post-service/src/api/interactions/Interaction.service.mts
class InteractionService {
  async likePost(userId: string, postId: string): Promise<void>
  async unlikePost(userId: string, postId: string): Promise<void>
  async addComment(userId: string, postId: string, content: string): Promise<Comment>
  async deleteComment(commentId: string, userId: string): Promise<void>
  async getPostLikes(postId: string, page: number): Promise<Like[]>
  async getPostComments(postId: string, page: number): Promise<Comment[]>
  async updateSocialStats(postId: string): Promise<void>
}
```

#### Social API Endpoints
```typescript
// post-service/src/api/interactions/Interaction.routes.mts
POST   /posts/:postId/like        // Like a post
DELETE /posts/:postId/like        // Unlike a post
POST   /posts/:postId/comments    // Add comment
DELETE /comments/:commentId       // Delete comment
GET    /posts/:postId/likes       // Get post likes
GET    /posts/:postId/comments    // Get post comments
```

#### Performance Optimization
```typescript
// post-service/src/utils/Cache.util.mts
class CacheUtil {
  static async cachePost(post: Post): Promise<void>
  static async getCachedPost(postId: string): Promise<Post | null>
  static async invalidatePostCache(postId: string): Promise<void>
  static async cacheSocialStats(postId: string, stats: SocialStats): Promise<void>
}
```

**Deliverables Week 6:**
- ✅ Like/unlike functionality
- ✅ Comment system working
- ✅ Social stats updating correctly
- ✅ Basic caching implemented

## Week 7-8: Feed System & React Native Frontend

### Week 7: Feed Service
**Objectives**: Home feed generation and caching

#### Feed Service Implementation (MongoDB + Redis)
```typescript
// feed-service/src/api/feed/Feed.service.mts
class FeedService {
  async generateHomeFeed(userId: string, page: number): Promise<FeedItem[]>
  async refreshUserFeed(userId: string): Promise<void>
  async addToFollowerFeeds(post: Post): Promise<void>
  async removeFromFollowerFeeds(postId: string): Promise<void>
  private async getFeedFromCache(userId: string, page: number): Promise<FeedItem[] | null>
  private async cacheFeedPage(userId: string, page: number, items: FeedItem[]): Promise<void>
}
```

#### Feed Generation Strategy
```typescript
// feed-service/src/utils/FeedBuilder.util.mts
class FeedBuilder {
  static async buildHomeFeed(userId: string, limit: number): Promise<FeedItem[]> {
    // 1. Get user's following list from Profile Service
    // 2. Fetch recent posts from those users
    // 3. Sort by created date
    // 4. Add engagement scores for ranking
    // 5. Return paginated results
  }
  
  static async buildTimelineFeed(goalId: string): Promise<FeedItem[]> {
    // Get all posts for a goal, sorted by progressDate
  }
}
```

#### Feed API Endpoints
```typescript
// feed-service/src/api/feed/Feed.routes.mts
GET    /feed/home                 // Get user's home feed
GET    /feed/goal/:goalId         // Get goal timeline
POST   /feed/refresh              // Refresh user's feed cache
```

#### Redis Caching Strategy
```typescript
// feed-service/src/cache/FeedCache.service.mts
class FeedCacheService {
  // Cache structure: "feed:user:{userId}:page:{page}" -> FeedItem[]
  async cacheFeed(userId: string, page: number, items: FeedItem[]): Promise<void>
  async getCachedFeed(userId: string, page: number): Promise<FeedItem[] | null>
  async invalidateUserFeed(userId: string): Promise<void>
  async addToCache(userId: string, newItem: FeedItem): Promise<void>
}
```

**Deliverables Week 7:**
- ✅ Feed service generating home feeds
- ✅ Redis caching working
- ✅ Feed API responding under 500ms

### Week 8: React Native Frontend
**Objectives**: Complete mobile app connecting all services

#### React Native Project Setup
```typescript
// frontend/app_client/src/navigation/AppNavigator.tsx
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Main" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// frontend/app_client/src/navigation/TabNavigator.tsx
const TabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Goals" component={GoalsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
```

#### Key React Native Screens
```typescript
// Auth Flow
- LoginScreen: Social login buttons
- OnboardingScreen: Basic profile setup

// Main App Flow  
- FeedScreen: Infinite scroll feed with pull-to-refresh
- GoalsScreen: Goal list and goal detail timelines
- ProfileScreen: User stats, goals, follower lists
- CreatePostScreen: Progress post creation with camera
- CreateGoalScreen: Goal creation form
```

#### API Integration
```typescript
// frontend/app_client/src/services/api.ts
class ApiClient {
  private baseURL: string;
  private authToken?: string;

  async login(provider: 'google' | 'apple'): Promise<AuthResponse>
  async createGoal(goal: CreateGoalRequest): Promise<Goal>
  async createPost(post: CreatePostRequest): Promise<Post>
  async getFeed(page: number): Promise<FeedItem[]>
  async followUser(userId: string): Promise<void>
  async likePost(postId: string): Promise<void>
}
```

#### State Management (Redux Toolkit)
```typescript
// frontend/app_client/src/store/slices/authSlice.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

// frontend/app_client/src/store/slices/feedSlice.ts
interface FeedState {
  items: FeedItem[];
  hasMore: boolean;
  isLoading: boolean;
  lastRefresh: Date;
}
```

**Deliverables Week 8:**
- ✅ React Native app with all core features
- ✅ Social login working on mobile
- ✅ Goal creation and progress posting
- ✅ Feed viewing and social interactions
- ✅ App ready for beta testing

## Testing Strategy

### Backend Testing
```typescript
// Unit Tests (Jest)
- Service layer unit tests
- Utility function tests
- Database operation tests

// Integration Tests
- API endpoint tests with test database
- Service-to-service communication tests
- Authentication flow tests

// Performance Tests
- Load testing with Artillery
- Database query performance
- Feed generation speed tests
```

### Frontend Testing
```typescript
// React Native Testing
- Component unit tests (React Native Testing Library)
- Screen integration tests
- Navigation flow tests
- API integration tests with mock data
```

### End-to-End Testing
```typescript
// E2E Test Scenarios
- Complete user registration and goal creation flow
- Post creation and feed viewing
- Social interactions (follow, like, comment)
- Profile management and privacy controls
```

## Performance Requirements

### 500ms Response Time Targets
- **Auth endpoints**: < 200ms
- **Profile operations**: < 300ms  
- **Feed generation**: < 500ms
- **Post creation**: < 400ms
- **Social interactions**: < 200ms

### Optimization Strategies
```typescript
// Database Optimization
- Proper indexing on all query paths
- Connection pooling for PostgreSQL
- MongoDB aggregation pipelines for feed
- Redis caching for frequently accessed data

// API Optimization  
- Response compression
- Pagination for all list endpoints
- Minimal data transfer (only required fields)
- Parallel service calls where possible

// Frontend Optimization
- Infinite scroll with virtualization
- Image lazy loading and caching
- Optimistic UI updates
- Background data refreshing
```

## Risk Mitigation

### Technical Risks
1. **Database Performance**: 
   - Mitigation: Comprehensive indexing, query optimization, monitoring
2. **Service Communication Latency**:
   - Mitigation: Service co-location, caching, timeout handling
3. **Mobile App Performance**:
   - Mitigation: Performance profiling, memory optimization, testing on low-end devices

### Development Risks
1. **OAuth Integration Complexity**:
   - Mitigation: Early implementation, thorough testing, fallback plans
2. **Cross-service Data Consistency**:
   - Mitigation: Event-driven updates, eventual consistency patterns, monitoring
3. **Frontend-Backend Integration**:
   - Mitigation: API-first development, mock data, continuous integration

## Success Metrics

### Technical KPIs
- ✅ All APIs respond under 500ms (P95)
- ✅ App crash rate < 1%
- ✅ Database queries under 100ms
- ✅ 99.9% service uptime

### Product KPIs  
- ✅ User can complete registration in < 30 seconds
- ✅ Goal creation takes < 1 minute
- ✅ Post creation with image < 2 minutes
- ✅ Feed loads in < 500ms

### Quality Gates
- ✅ 80%+ test coverage on backend services
- ✅ All critical user flows covered by E2E tests
- ✅ Performance tests passing on all endpoints
- ✅ Security audit complete (OAuth, JWT, data protection)

## Phase 1 Completion Checklist

### Infrastructure ✅
- [ ] GCP infrastructure deployed via Pulumi
- [ ] All 4 microservices deployed to Cloud Run
- [ ] PostgreSQL and MongoDB databases operational
- [ ] Redis caching layer working
- [ ] CI/CD pipeline functional

### Backend Services ✅
- [ ] Auth service with Google/Apple OAuth
- [ ] Profile service with goals and social features
- [ ] Post service with media upload
- [ ] Feed service with caching
- [ ] All APIs under 500ms response time

### Frontend ✅
- [ ] React Native app on iOS and Android
- [ ] Social login integration
- [ ] Goal management screens
- [ ] Progress posting with camera
- [ ] Feed with infinite scroll
- [ ] Social interactions working

### Testing & Quality ✅
- [ ] Unit tests passing (80%+ coverage)
- [ ] Integration tests covering critical paths
- [ ] E2E tests for core user flows
- [ ] Performance tests meeting 500ms targets
- [ ] Security review complete

### Documentation ✅
- [ ] API documentation for all endpoints
- [ ] Database schema documentation
- [ ] Deployment guides
- [ ] Testing procedures
- [ ] Monitoring and alerting setup

## Next Steps to Phase 2

After Phase 1 completion, the foundation will be ready for Phase 2 features:
- Inspiration chains (quoting system)
- Journey curation tools
- Enhanced social discovery
- Advanced feed algorithms

The MVP from Phase 1 provides the solid foundation for these advanced social features while ensuring core functionality is robust and performant.