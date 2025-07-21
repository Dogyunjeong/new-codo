# Project Requirements: Goal Sharing Social App

## Project Overview

A social platform where users can create goals, share progress updates, and interact with others' journeys. Similar to Threads but focused on continuous progress and growth rather than goal completion. We believe progress is a part of growing.

## Functional Requirements

### Core Features

### Key Concepts

- **Progress-Focused**: Emphasis on continuous growth and progress sharing rather than goal completion
- **Inspiration Chains**: Blockchain-like system where inspired posts can create chains of motivation
- **Goal Journeys**: Each goal represents an ongoing journey without time constraints

#### Goal Management

- **Create Goals**: Users can create multiple personal goals with titles and descriptions (no time limits)
- **Continuous Progress**: Focus on ongoing progress rather than completion
- **Progress Journey**: Visual timeline of progress posts for each goal (chronologically ordered by actual progress date)

#### Journey Creation

- **Hero Journeys**: Curated collections of progress posts from a goal to create inspiring stories
- **Journey Curation**: Select key progress posts (steps) to highlight the transformation story
- **Inspiration Focus**: Journeys designed to motivate others by showcasing the complete growth narrative
- **Journey Sharing**: Standalone shareable content that tells a compelling progress story

#### Progress Sharing (Posts)

- **Create Progress Posts**: Share updates with photos/videos and limited text for specific goals
- **Goal Association**: Each progress post must be linked to a specific goal
- **Media Support**: Upload images and videos to document progress
- **Text Limits**: Character limit for post descriptions (e.g., 500 characters)
- **Timestamps**: Automatic or custom date/time tracking for progress posts (supports past dates for timeline organization)
- **Hashtags/Tags**: Categorize posts
- **Progress Context**: Show progress within the context of the ongoing goal journey
- **Steps**: Individual progress posts that document incremental growth

#### Social Interaction

- **Follow Users**: Follow other users to see their progress
- **Inspiration Feature**: Special type of post that quotes others' progress posts with optional commentary
- **Inspiration Chains**: Create blockchain-like chains where inspirations can quote other inspirations, creating viral motivation threads
- **Explore Goals**: Browse and discover other users' goals and progress
- **Journey Discovery**: Discover curated hero journeys that showcase inspiring transformations
- **Engagement**: Like, comment, and share progress posts
- **Progress Discovery**: Find inspiring progress stories from other users

#### Discovery & Feed

- **Home Feed**: Chronological feed of followed users' progress
- **Explore Page**: Discover trending goals, progress posts, and featured journeys
- **Search**: Find users, goals, and specific progress updates
- **Recommendations**: Suggest goals and users

### User Management

- **User Registration/Login**: Social authentication only (Google, Apple, etc.)
- **User Profiles**: Display followers, steps (progress posts count), goal list, and journeys
- **Profile Customization**: Bio, profile picture, goal highlights
- **Privacy Settings**: Control visibility of goals and progress

## Technical Requirements

### Frontend (React Native)

- **Cross-Platform**: React Native for iOS and Android
- **Mobile-First Design**: Native mobile experience optimized for touch
- **Real-time Updates**: Live feed updates for new posts
- **Media Handling**: Image/video upload, compression, and display
- **Offline Support**: Basic offline viewing and draft saving
- **Native Features**: Camera integration, push notifications, device storage

### Backend

- **Microservices Architecture**: Separate Fastify services for auth, profiles/goals, feed, and posts using shared base-server package
- **Hybrid Database Strategy**: PostgreSQL for structured data, MongoDB for high-volume posts
- **User Authentication**: Social login integration (OAuth)
- **Data Storage**: Multi-database approach optimized for different data types
- **API Design**: RESTful API for mobile and web clients
- **Real-time Features**: WebSocket support for live updates
- **Media Storage**: Cloud storage for images and videos
- **Search Engine**: Full-text search for goals and posts across databases

### Database Architecture

#### PostgreSQL (Structured Data)

- **Users**: Profile data, authentication, settings, session management
- **Goals**: Goal details, privacy settings, user associations
- **Relationships**: User follows, goal associations, user social stats
- **Inspiration Chains**: Chain relationships with hierarchical queries and depth tracking
- **Analytics**: User engagement metrics, trending calculations

#### MongoDB (High-Volume Content)

- **Posts**: Progress updates with flexible schema for media and metadata
- **Comments**: Post comments with nested reply structures
- **Feed Data**: Denormalized feed content for fast retrieval
- **Media Metadata**: File references, processing status, thumbnails
- **Search Indexes**: Full-text search for posts and hashtags

#### Redis (Caching Layer)

- **Feed Cache**: Pre-generated user feeds for instant loading
- **Session Storage**: User sessions and temporary data
- **Rate Limiting**: API request throttling and abuse prevention
- **Real-time Data**: WebSocket session management

### Performance & Scalability

- **Hybrid Database Strategy**: PostgreSQL for ACID transactions, MongoDB for high-volume reads/writes
- **Caching**: Multi-layer Redis caching for feeds, sessions, and frequently accessed data
- **CDN**: Content delivery for media files with global edge locations
- **Database Optimization**:
  - PostgreSQL: Complex indexes for social queries, partitioning for large tables
  - MongoDB: Compound indexes for post retrieval, sharding for horizontal scaling
- **Load Balancing**: Auto-scaling Cloud Run services with traffic distribution
- **Data Synchronization**: Event-driven updates between PostgreSQL and MongoDB
- **Feed Generation**: Denormalized data in MongoDB for sub-second feed loading

### Security

- **Data Privacy**: GDPR compliance for user data
- **Content Moderation**: Automated and manual content review
- **Rate Limiting**: Prevent spam and abuse
- **Secure Media**: Virus scanning for uploaded files

## Non-Functional Requirements

### User Experience

- **Performance**: Fast loading times (<500ms for feed and navigation)
- **Accessibility**: React Native accessibility standards
- **Cross-platform**: iOS and Android native apps
- **Intuitive UI**: Simple, engaging mobile-first interface design
- **Native Feel**: Platform-specific UI components and navigation patterns

### Reliability

- **Uptime**: 99.9% availability target
- **Data Backup**: Regular automated backups
- **Error Handling**: Graceful error recovery
- **Monitoring**: System health and performance tracking

### Compliance

- **Privacy**: User data protection and control
- **Content Policy**: Community guidelines enforcement
- **Age Restrictions**: Appropriate content filtering

## Success Metrics

- **User Engagement**: Daily/monthly active users
- **Progress Engagement**: Frequency and consistency of progress sharing
- **Content Creation**: Posts per user per week
- **Social Interaction**: Likes, comments, follows, inspirations, inspiration chains
- **Retention**: User return rates and session duration

## Implementation Phases

### Phase 1: Core Foundation (Weeks 1-8)

- **Goal Management**: Create, edit, delete goals with privacy settings
- **Progress Posts (Steps)**: Basic posting with text and images, custom timestamps
- **User Profiles**: Display followers, steps count, goal list
- **Social Features**: Follow/unfollow users, basic likes and comments
- **Feed System**: Home feed with followed users' progress
- **Authentication**: Social login (Google, Apple) integration

### Phase 2: Inspiration & Journey Features (Weeks 9-16)

- **Inspiration Chains**: Quote progress posts with commentary, blockchain-like chaining
- **Journey Curation Tools**: Select and arrange steps into hero story narratives
- **Journey Sharing**: Standalone shareable journey content
- **Inspiration Discovery**: Trending chains and viral motivation threads
- **Enhanced Profiles**: Journey sections, inspiration history
- **Advanced Feed**: Include inspirations and journeys in discovery

### Phase 3: Discovery & Engagement (Weeks 17-24)

- **Search & Discovery**: Full-text search across users, goals, posts, journeys
- **Explore Page**: Trending content, featured journeys, goal recommendations
- **Real-time Features**: Live notifications, WebSocket updates for feeds
- **Enhanced Interactions**: Nested comments, reaction types, journey ratings
- **Content Recommendations**: Suggest goals, users, and journeys based on interests
- **Performance Optimization**: 500ms response time targets, caching improvements

### Phase 4: Advanced Features & Scale (Weeks 25-32)

- **Video Support**: Video upload, compression, thumbnail generation
- **Analytics Dashboard**: User insights, progress tracking, goal completion rates
- **Advanced Moderation**: Automated content review, community guidelines enforcement
- **Journey Templates**: Pre-built journey structures for common goals
- **Export Features**: Share journeys outside the app, PDF generation
- **Performance & Scale**: Database optimization, CDN implementation, load testing

## Technology Stack

### Finalized Architecture

- **Frontend**: React Native with TypeScript for cross-platform mobile development
- **Backend**: Node.js microservices with TypeScript and Fastify (using @packages/base-server)
- **Infrastructure**: Google Cloud Run with Pulumi IaC for serverless scaling
- **Databases**:
  - PostgreSQL (Cloud SQL) for users, goals, relationships, inspiration chains
  - MongoDB (Cloud Firestore/Atlas) for posts, comments, feed data
  - Redis (Cloud Memorystore) for caching and sessions
- **Real-time**: Socket.io for live updates and notifications
- **Media Storage**: Google Cloud Storage with Cloud CDN
- **Authentication**: JWT tokens with social OAuth providers (Google, Apple, GitHub)
- **Search**: MongoDB text indexes + Elasticsearch for advanced search features

### Microservice Data Distribution

- **Auth Service**: PostgreSQL (users, sessions, authentication)
- **Profile/Goal Service**: PostgreSQL (profiles, goals, user relationships)
- **Post/Inspiration Service**: MongoDB (posts, comments, media, basic inspirations)
- **Feed Service**: MongoDB + Redis (cached feeds, content discovery)

### Benefits of Hybrid Approach

- **PostgreSQL**: ACID transactions for critical user data, complex social queries, inspiration chain hierarchies
- **MongoDB**: High-performance post creation/retrieval, flexible content schema, horizontal scaling
- **Data Consistency**: Event-driven synchronization between databases
- **Performance**: Database choice optimized for each data access pattern
