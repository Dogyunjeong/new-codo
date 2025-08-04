# Ziririt - Goal Sharing Social App

A social platform where users can create goals, share progress updates, and interact with others' journeys. Built with a focus on continuous progress and growth rather than just goal completion.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Local Development Setup

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd ziririt-1
   cp .env.example .env
   ```

2. **Start All Services**
   ```bash
   make dev
   ```
   Or manually:
   ```bash
   docker-compose up -d
   ```

3. **Access the Application**
   - API Gateway: http://localhost:8080
   - Auth Service: http://localhost:4101
   - Profile Service: http://localhost:4102
   - Post Service: http://localhost:4103
   - Feed Service: http://localhost:4104

### Available Commands

```bash
make help          # Show all available commands
make dev           # Start all services in development mode
make down          # Stop all services
make logs          # Show logs from all services
make clean         # Clean up containers and volumes
make db-reset      # Reset and reinitialize databases
make test          # Run all tests
```

## 🏗️ Architecture

### Microservices Architecture
- **API Gateway** (Port 8080): Request routing, rate limiting, and CORS
- **Ziririt Auth Service** (Port 4101): User authentication and management
- **Ziririt Profile Service** (Port 4102): User profiles, goals, and social relationships
- **Ziririt Post Service** (Port 4103): Progress posts, comments, likes, and media
- **Ziririt Feed Service** (Port 4104): Feed generation and caching

### Database Strategy
- **PostgreSQL**: User data, profiles, goals, social relationships
- **MongoDB**: Posts, comments, likes, feed data
- **Redis**: Caching, sessions, real-time data

### Technology Stack
- **Backend**: Node.js, TypeScript, Fastify
- **Frontend**: React Native, TypeScript, Redux Toolkit
- **Infrastructure**: Docker, Docker Compose
- **Future**: GCP Cloud Run, Pulumi IaC

## 📱 Features

### Core Features (Phase 1)
- ✅ Social authentication (Google, Apple)
- ✅ Goal creation and management
- ✅ Progress posts with media support
- ✅ Social interactions (follow, like, comment)
- ✅ Home feed generation
- ✅ User profiles with statistics

### Planned Features (Phase 2+)
- Inspiration chains (quote system)
- Journey curation tools
- Enhanced discovery
- Real-time notifications
- Advanced analytics

## 🔧 Development

### Project Structure
```
ziririt-1/
├── backend/                         # Backend services
│   ├── Dockerfile.local            # Local development Docker config
│   ├── Dockerfile.prod             # Production Docker config  
│   ├── ecosystem.config.cjs        # PM2 process configuration
│   ├── ziririt-api-gateway/        # API Gateway service
│   ├── ziririt-auth-service/       # Authentication service
│   ├── ziririt-profile-service/    # Profile and goals service
│   ├── ziririt-post-service/       # Posts and interactions service
│   └── ziririt-feed-service/       # Feed generation service
├── frontend/
│   └── app_client/                 # React Native mobile app
├── packages/
│   ├── shared-types/               # Shared TypeScript types
│   └── base-server/                # Shared server utilities
├── scripts/
│   └── db/                         # Database initialization scripts
└── plans/                          # Project documentation
```

### Database Access
```bash
# PostgreSQL
make db-psql

# MongoDB
make db-mongo

# Redis
make db-redis
```

### Running Individual Services
```bash
make auth      # Ziririt auth service only
make profile   # Ziririt profile service only
make post      # Ziririt post service only
make feed      # Ziririt feed service only
make gateway   # Ziririt API gateway only
```

## 🧪 Testing

Sample data is automatically loaded during database initialization:
- 3 test users with profiles and goals
- Sample progress posts with media
- Social relationships and interactions
- Comments and likes

## 📊 API Endpoints

All requests go through the **API Gateway (8080)** with the following routes:

### Auth Routes
- `POST /auth/google` - Google OAuth login
- `POST /auth/apple` - Apple OAuth login
- `POST /auth/refresh` - Refresh JWT token
- `GET /auth/me` - Get current user

### Profile Routes
- `GET /profiles/:userId` - Get user profile
- `GET /profiles/:userId/goals` - Get user's goals
- `POST /social/follow/:userId` - Follow user
- `GET /social/relationship/:userId` - Check relationship

### Post Routes
- `POST /posts` - Create progress post
- `GET /posts/:postId` - Get post details
- `POST /posts/:postId/like` - Like/unlike post
- `POST /posts/:postId/comments` - Add comment

### Feed Routes
- `GET /feed/home` - Get user's home feed
- `GET /feed/goal/:goalId` - Get goal timeline
- `POST /feed/refresh` - Refresh feed cache

### Direct Service Access (Development Only)
- **Ziririt Auth Service**: http://localhost:4101
- **Ziririt Profile Service**: http://localhost:4102
- **Ziririt Post Service**: http://localhost:4103
- **Ziririt Feed Service**: http://localhost:4104

## 🔐 Environment Configuration

Copy `.env.example` to `.env` and configure:
- Database URLs
- JWT secrets
- OAuth credentials (Google, Apple)
- Service URLs
- Media storage settings

## 📦 Deployment

Local development uses Docker Compose. Production deployment planned for:
- GCP Cloud Run (serverless containers)
- Cloud SQL (PostgreSQL)
- MongoDB Atlas
- Cloud Memorystore (Redis)
- Pulumi for Infrastructure as Code

## 🤝 Contributing

1. Follow the Phase 1 implementation plan in `plans/phase1_implementation.md`
2. Use the shared TypeScript types in `packages/shared-types/`
3. Test locally with Docker Compose before cloud deployment
4. Maintain 80%+ test coverage
5. Follow security best practices

## 📚 Documentation

- [Project Requirements](plans/requirements.md)
- [System Design](plans/v0.1_plan.md)
- [Implementation Plan](plans/phase1_implementation.md)
- [About the Project](plans/about.md)

## 🛡️ Security

- JWT-based authentication
- OAuth 2.0 social login
- Rate limiting via API Gateway
- Input validation and sanitization
- CORS configuration for development
- Service-to-service authentication

## 📄 License

[Add your license here]