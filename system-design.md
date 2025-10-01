# Ziririt - System Design Document

## Overview

Ziririt is a journey-sharing social platform focused on progress tracking and continuous growth. Users create journeys, share progress updates, and engage with others' journeys. The platform emphasizes ongoing progress rather than completion, fostering a community of continuous improvement and inspiration.

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  React Native   │    │   Web Client    │    │  Mobile Apps    │
│   (iOS/Android) │    │   (Future)      │    │   (Future)      │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      API Gateway          │
                    │    (NGINX/Fastify)        │
                    │    Port: 8080             │
                    └─────────────┬─────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
    ┌─────▼─────┐         ┌───────▼───────┐       ┌─────▼─────┐
    │Auth Service│         │Profile Service│       │Post Service│
    │Port: 4101  │         │Port: 4102     │       │Port: 4103  │
    │PostgreSQL  │         │PostgreSQL     │       │MongoDB     │
    └─────┬─────┘         └───────┬───────┘       └─────┬─────┘
          │                       │                       │
          └───────────────────────┼───────────────────────┘
                                  │
                        ┌─────────▼─────────┐
                        │   Feed Service    │
                        │   Port: 4104      │
                        │  MongoDB + Redis  │
                        └───────────────────┘
```

### Microservices Architecture

The system follows a microservices pattern with four core services:

1. **API Gateway** - Request routing, rate limiting, CORS
2. **Auth Service** - User authentication and management
3. **Profile Service** - User profiles, journeys, social relationships
4. **Post Service** - Progress posts, comments, likes, media
5. **Feed Service** - Feed generation and caching

## Database Design

### Multi-Database Strategy

The system uses a hybrid database approach optimized for different data types and access patterns:

#### PostgreSQL (Cloud SQL)
**Used for**: Structured data requiring ACID transactions and complex queries
- User authentication and profiles
- Goals and privacy settings
- Social relationships (follows)
- Inspiration chain hierarchies (future)

#### MongoDB (Atlas)
**Used for**: High-volume content with flexible schema
- Progress posts and media metadata
- Comments and social interactions
- Feed data and caching
- Search indexes

#### Redis (Memorystore)
**Used for**: Caching and session management
- Feed cache for instant loading
- Session storage
- Rate limiting counters
- Real-time data

### Database Schema

#### PostgreSQL Schema

```sql
-- Users table (Auth Service)
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

-- Refresh tokens table (Auth Service)
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Profiles table (Profile Service)
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  is_private BOOLEAN DEFAULT false,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  steps_count INTEGER DEFAULT 0,
  journeys_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Journeys table (Profile Service)
CREATE TABLE journeys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT false,
  steps_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Follows table (Profile Service)
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);
```

#### MongoDB Schema

```javascript
// Posts collection (Post Service)
{
  _id: ObjectId,
  id: String,           // UUID
  userId: String,       // User who created
  journeyId: String,       // Associated journey
  content: String,      // Post content (max 500 chars)
  mediaFiles: [{
    id: String,
    url: String,
    type: 'image' | 'video',
    thumbnailUrl: String
  }],
  hashtags: [String],
  isMilestone: Boolean,
  progressDate: Date,   // When progress happened
  createdAt: Date,      // When posted
  updatedAt: Date,
  
  // Cached social stats
  likesCount: Number,
  commentsCount: Number
}

// Likes collection (Post Service)
{
  _id: ObjectId,
  id: String,
  userId: String,
  postId: String,
  postType: 'progress_post',
  createdAt: Date
}

// Comments collection (Post Service)
{
  _id: ObjectId,
  id: String,
  userId: String,
  postId: String,
  postType: 'progress_post',
  content: String,
  parentCommentId: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Database Indexes

#### PostgreSQL Indexes
```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider, provider_id);

-- Journeys
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_goals_created ON goals(created_at DESC);

-- Follows
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
```

#### MongoDB Indexes
```javascript
// Posts collection
db.posts.createIndex({ "userId": 1, "createdAt": -1 });
db.posts.createIndex({ "journeyId": 1, "progressDate": -1 });
db.posts.createIndex({ "createdAt": -1 });
db.posts.createIndex({ "hashtags": 1 });

// Likes collection
db.likes.createIndex({ "postId": 1 });
db.likes.createIndex({ "userId": 1, "postId": 1 }, { unique: true });

// Comments collection
db.comments.createIndex({ "postId": 1, "createdAt": 1 });
db.comments.createIndex({ "userId": 1 });
```

## Service Details

### 1. API Gateway (Port 8080)

**Technology**: NGINX (current) / Fastify (future)
**Responsibilities**:
- Route requests to appropriate microservices
- Rate limiting (10 req/s general, 5 req/s auth)
- CORS handling for development
- Request/response logging
- Health checks

**Routing Configuration**:
```nginx
/auth/*      → Auth Service (4101)
/profiles/*  → Profile Service (4102)
/social/*    → Profile Service (4102)
/posts/*     → Post Service (4103)
/media/*     → Post Service (4103)
/feed/*      → Feed Service (4104)
```

### 2. Auth Service (Port 4101)

**Technology**: Fastify + PostgreSQL
**Database**: PostgreSQL (users, refresh_tokens)

**Key Features**:
- Social OAuth (Google, Apple)
- JWT token generation and verification
- Refresh token management
- User registration and authentication

**API Endpoints**:
```
POST /auth/google          # Google OAuth callback
POST /auth/apple           # Apple OAuth callback
POST /auth/refresh         # Refresh JWT token
POST /auth/logout          # Revoke refresh token
GET  /auth/verify          # Verify JWT token
GET  /auth/me              # Get current user info
```

**Security**:
- JWT tokens (15-minute expiry)
- Refresh tokens (7-day expiry)
- bcrypt for token hashing
- Rate limiting on auth endpoints

### 3. Profile Service (Port 4102)

**Technology**: Fastify + PostgreSQL
**Database**: PostgreSQL (profiles, journeys, follows)

**Key Features**:
- User profile management
- Journey CRUD operations
- Social relationships (follow/unfollow)
- Privacy controls
- Social statistics

**API Endpoints**:
```
GET    /profiles/:userId           # Get user profile
PUT    /profiles/:userId           # Update profile
GET    /profiles/:userId/journeys  # Get user's journeys
GET    /profiles/:userId/followers # Get followers list
GET    /profiles/:userId/following # Get following list
POST   /social/follow/:userId      # Follow a user
DELETE /social/follow/:userId      # Unfollow a user
GET    /social/relationship/:userId # Check relationship status
```

### 4. Post Service (Port 4103)

**Technology**: Fastify + MongoDB
**Database**: MongoDB (posts, likes, comments)

**Key Features**:
- Progress post creation and management
- Media upload and processing
- Social interactions (likes, comments)
- Post timeline for journeys
- Social statistics caching

**API Endpoints**:
```
POST   /posts                     # Create progress post
GET    /posts/:postId             # Get single post
PUT    /posts/:postId             # Update post
DELETE /posts/:postId             # Delete post
GET    /posts/journey/:journeyId  # Get posts for a journey
POST   /posts/:postId/like        # Like a post
DELETE /posts/:postId/like        # Unlike a post
POST   /posts/:postId/comments    # Add comment
DELETE /comments/:commentId       # Delete comment
POST   /media/upload              # Upload media files
```

**Media Handling**:
- Local file storage (development)
- Cloud Storage (production)
- Image compression and thumbnail generation
- 10MB file size limit

### 5. Feed Service (Port 4104)

**Technology**: Fastify + MongoDB + Redis
**Database**: MongoDB (feed data) + Redis (cache)

**Key Features**:
- Home feed generation
- Journey timeline feeds
- Redis caching for performance
- Feed refresh and invalidation
- Cross-service data aggregation

**API Endpoints**:
```
GET    /feed/home                 # Get user's home feed
GET    /feed/journey/:journeyId   # Get journey timeline
POST   /feed/refresh              # Refresh user's feed cache
```

**Feed Generation Strategy**:
1. Get user's following list from Profile Service
2. Fetch recent posts from those users
3. Sort by creation date
4. Cache results in Redis
5. Return paginated results

## Data Flow

### User Registration Flow
```
Mobile App → API Gateway → Auth Service → PostgreSQL
                        ↓
                Profile Service → PostgreSQL (create profile)
```

### Post Creation Flow
```
Mobile App → API Gateway → Post Service → MongoDB
                        ↓
                Profile Service (update stats) → PostgreSQL
                        ↓
                Feed Service (update followers' feeds) → Redis
```

### Feed Generation Flow
```
Mobile App → API Gateway → Feed Service
                        ↓
                Profile Service (get following list) → PostgreSQL
                        ↓
                Post Service (get recent posts) → MongoDB
                        ↓
                Redis (cache feed) → Return to user
```

## Infrastructure & Deployment

### Local Development
- **Docker Compose**: All services containerized
- **Databases**: PostgreSQL, MongoDB, Redis containers
- **Development**: Hot reload with TypeScript
- **Testing**: Jest for unit tests, Artillery for performance

### Production (GCP)
- **Cloud Run**: Serverless container deployment
- **Cloud SQL**: Managed PostgreSQL
- **MongoDB Atlas**: Managed MongoDB cluster
- **Memorystore**: Managed Redis
- **Cloud Storage**: Media file storage
- **Load Balancer**: SSL termination and routing
- **Pulumi**: Infrastructure as Code

### CI/CD Pipeline
```
GitHub → Actions → Build Docker Images → Deploy to Cloud Run
                ↓
        Run Tests → Update Infrastructure (Pulumi)
```

## Performance Targets

### Response Time Goals
- **Auth endpoints**: < 200ms
- **Profile operations**: < 300ms
- **Feed generation**: < 500ms
- **Post creation**: < 400ms
- **Social interactions**: < 200ms

### Optimization Strategies
1. **Database Optimization**:
   - Proper indexing on all query paths
   - Connection pooling
   - Query optimization
   
2. **Caching Strategy**:
   - Redis for feed cache
   - Application-level caching
   - CDN for media files
   
3. **API Optimization**:
   - Response compression
   - Pagination for all list endpoints
   - Parallel service calls

## Security

### Authentication & Authorization
- **OAuth 2.0**: Google and Apple social login
- **JWT Tokens**: Short-lived access tokens (15 minutes)
- **Refresh Tokens**: Long-lived refresh tokens (7 days)
- **Service-to-Service**: Inter-service authentication

### Data Protection
- **Input Validation**: All endpoints validate input
- **SQL Injection**: Parameterized queries
- **Rate Limiting**: Prevent abuse and spam
- **CORS**: Controlled cross-origin requests

### Privacy Controls
- **Private Goals**: User-controlled goal visibility
- **Private Profiles**: Account privacy settings
- **Data Minimization**: Only collect necessary data
- **GDPR Compliance**: User data rights and deletion

## Monitoring & Observability

### Metrics
- **Application Metrics**: Response times, error rates
- **Database Metrics**: Query performance, connection counts
- **Infrastructure Metrics**: CPU, memory, disk usage
- **Business Metrics**: User engagement, content creation

### Logging
- **Structured Logging**: JSON format for all services
- **Log Aggregation**: Centralized log collection
- **Error Tracking**: Exception monitoring and alerting

### Health Checks
- **Service Health**: Individual service health endpoints
- **Database Health**: Connection and query health
- **Dependencies**: External service availability

## Scalability & Future Considerations

### Phase 1 (Current): Core Foundation
- Basic goal and progress tracking
- Social interactions (follow, like, comment)
- Home feed generation

### Phase 2 (Future): Advanced Features
- **Inspiration Chains**: Viral motivation threads
- **Journey Curation**: Hero story creation
- **Advanced Search**: Full-text search across content
- **Real-time Updates**: WebSocket notifications

### Phase 3 (Future): Scale & Analytics
- **Video Support**: Video upload and processing
- **Analytics Dashboard**: User insights and metrics
- **Advanced Moderation**: AI-powered content review
- **Export Features**: Journey sharing and PDF generation

### Scalability Patterns
- **Horizontal Scaling**: Cloud Run auto-scaling
- **Database Sharding**: MongoDB horizontal partitioning
- **Read Replicas**: PostgreSQL read scaling
- **CDN**: Global content distribution
- **Event-Driven Architecture**: Microservice communication

## Risk Assessment

### Technical Risks
1. **Database Performance**: Mitigated by proper indexing and caching
2. **Service Communication**: Mitigated by timeouts and circuit breakers
3. **Data Consistency**: Mitigated by event-driven updates
4. **Scaling Challenges**: Mitigated by cloud-native architecture

### Security Risks
1. **OAuth Vulnerabilities**: Mitigated by secure token handling
2. **Data Breaches**: Mitigated by encryption and access controls
3. **API Abuse**: Mitigated by rate limiting and monitoring
4. **Social Engineering**: Mitigated by user education and controls

## Success Metrics

### Technical KPIs
- **Response Time**: 95th percentile under 500ms
- **Uptime**: 99.9% service availability
- **Error Rate**: < 1% of requests
- **Database Performance**: Queries under 100ms

### Business KPIs
- **User Engagement**: Daily active users
- **Content Creation**: Posts per user per week
- **Social Interaction**: Likes, comments, follows
- **Retention**: User return rates

## Conclusion

The Ziririt system is designed as a scalable, performant social platform focused on progress sharing and community building. The microservices architecture with hybrid database strategy provides flexibility and optimization for different data types and access patterns. The system is built with cloud-native principles, ensuring scalability and reliability for future growth.

The modular design allows for incremental feature development and deployment, with clear separation of concerns across services. The comprehensive monitoring and security measures ensure reliable operation and user data protection.
