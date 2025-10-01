# Mobile Client Requirements - Phase 1

## Overview
This document outlines the requirements and implementation tasks for Phase 1 of the HeroJourney mobile client application.

## Design Screens (Completed)
- ✅ Home Screen - Feed with posts, story bar, and tabs
- ✅ Profile Screen - User profile with stats, tags, and journeys
- ✅ Profile Section (with scroll behavior) - Collapsible header with feed tabs
- ✅ Add New Step Screen - Modal for creating new journey steps

## Completed Components

### UI Components
- ✅ Avatar - Reusable avatar with size variants and fallbacks
- ✅ Pill - Category/tag pills with active states
- ✅ TabBar - Scrollable tab bar component
- ✅ StoryBar - "Share your next step" input bar
- ✅ PostCard - Complete post layout with engagement
- ✅ ProfileHeader - Profile info with edit/settings
- ✅ ProfileStats - Steps, followers, following display
- ✅ ProfileTags - User interest tags
- ✅ JourneyCard - Journey cards with images and badges
- ✅ JourneySection - Horizontal scrolling journey list
- ✅ StepCard - Profile feed cards with step types
- ✅ CreateStepHeader - Modal header with close/share
- ✅ JourneySelector - Journey dropdown selector
- ✅ StepContentInput - Auto-expanding text input
- ✅ MediaToolbar - Media upload buttons
- ✅ MomentSelector - Up/Down moment selection
- ✅ InspirationSection - Add inspiration component
- ✅ ReminderNote - Lightbulb reminder text

### Screens & Navigation
- ✅ Tab navigation with floating add button
- ✅ Home feed screen with mock data
- ✅ Profile screen with collapsible header
- ✅ Add New Step modal (accessible from all screens)
- ✅ Context provider for modal management

### Theme & Styling
- ✅ Complete theme system (colors, typography, spacing)
- ✅ Consistent design matching HeroJourney mockups
- ✅ Responsive layouts
- ✅ Platform-specific styling (iOS/Android)

## Phase 1 Implementation TODOs

### 1. Core Setup & Infrastructure
- [x] Configure React Native navigation structure for Phase 1 screens
- [x] Set up Redux store with required slices (auth, feed, profile, goals)
- [x] Configure API client with proper endpoints for all services
- [ ] Set up authentication flow and token management
- [ ] Configure deep linking for app navigation
- [ ] Set up push notification infrastructure

### 2. Authentication & Onboarding
- [ ] Implement login screen UI based on design
- [ ] Add social authentication (Google, Apple, Facebook)
- [ ] Create onboarding flow for new users
- [ ] Implement secure token storage using react-native-keychain
- [ ] Add biometric authentication support
- [ ] Handle session management and auto-refresh

### 3. Home Screen (Feed)
- [x] Implement feed list component with infinite scroll
- [x] Create post card component matching design
- [x] Add pull-to-refresh functionality
- [x] Implement like/comment interactions
- [x] Add feed filtering options (following, trending, new)
- [ ] Create empty state for no posts
- [ ] Add loading states and skeleton screens
- [ ] Implement real-time updates for new posts

### 4. Profile Screen
- [x] Create profile header component with user info
- [x] Implement profile stats section (followers, following, posts)
- [ ] Add profile editing functionality
- [x] Create user posts grid/list view
- [ ] Implement follower/following lists
- [x] Add profile settings menu
- [x] Create profile scroll behavior with hidden section
- [ ] Implement profile image upload and cropping

### 5. Add New Step Screen
- [x] Design step creation form matching mockup
- [x] Implement multi-step creation flow
- [x] Add media upload functionality (photo/video)
- [x] Create goal selection/creation component
- [x] Add step description editor
- [ ] Implement draft saving functionality
- [x] Add validation and error handling
- [ ] Create preview before posting

### 6. Goals Management
- [ ] Create goals list screen
- [ ] Implement goal detail view
- [ ] Add goal creation flow
- [ ] Create goal progress tracking UI
- [ ] Implement milestone/step linking
- [ ] Add goal sharing functionality
- [ ] Create goal achievement animations

### 7. Common Components
- [x] Create reusable button components
- [x] Implement custom input fields
- [x] Create modal/bottom sheet components
- [ ] Add toast/snackbar notifications
- [ ] Implement loading indicators
- [ ] Create image viewer component
- [x] Add custom tab bar matching design
- [ ] Create search bar component

### 8. API Integration
- [ ] Connect auth endpoints with AuthController
- [ ] Integrate profile endpoints with ProfileController
- [ ] Connect feed service for posts
- [ ] Implement goal-related API calls
- [ ] Add error handling and retry logic
- [ ] Implement offline support with caching
- [ ] Add API request interceptors for auth

### 9. State Management
- [ ] Set up auth slice with user session
- [ ] Configure feed slice with pagination
- [ ] Create profile slice with user data
- [ ] Implement goals slice
- [ ] Add notification state management
- [ ] Configure app settings/preferences

### 10. Performance & Optimization
- [ ] Implement image lazy loading
- [ ] Add list virtualization for large datasets
- [ ] Configure memory management
- [ ] Optimize bundle size
- [ ] Add performance monitoring
- [ ] Implement code splitting

### 11. Testing
- [ ] Write unit tests for Redux slices
- [ ] Create component tests for screens
- [ ] Add integration tests for API calls
- [ ] Implement E2E tests for critical flows
- [ ] Add snapshot tests for UI components
- [ ] Create performance benchmarks

### 12. UI/UX Polish
- [x] Implement app theme and styling system
- [x] Add animations and transitions
- [ ] Create haptic feedback for interactions
- [ ] Implement gesture handlers
- [ ] Add accessibility features
- [ ] Support dark mode
- [x] Ensure responsive design for different screen sizes

### 13. Error Handling & Monitoring
- [ ] Set up crash reporting (Sentry/Crashlytics)
- [ ] Add analytics tracking
- [ ] Implement error boundaries
- [ ] Create user-friendly error messages
- [ ] Add network connectivity handling
- [ ] Implement retry mechanisms

### 14. Deployment Preparation
- [ ] Configure build settings for iOS
- [ ] Configure build settings for Android
- [ ] Set up CI/CD pipeline
- [ ] Create app store assets
- [ ] Prepare release notes
- [ ] Configure environment variables
- [ ] Set up beta testing distribution

## Priority Order for Implementation

### Phase 1A (Core Foundation) - Week 1-2
1. Core setup & infrastructure
2. Authentication flow
3. Basic navigation structure
4. API client configuration

### Phase 1B (Main Screens) - Week 3-4
1. Home screen with feed
2. Profile screen implementation
3. Basic state management
4. API integration for core features

### Phase 1C (Content Creation) - Week 5
1. Add New Step screen
2. Media upload functionality
3. Journey creation and management

### Phase 1D (Polish & Testing) - Week 6
1. UI/UX polish
2. Testing implementation
3. Performance optimization
4. Error handling

## Technical Stack
- React Native with Expo
- Redux Toolkit for state management
- React Navigation for routing
- Shared controllers from @base/shared-controllers
- TypeScript for type safety

## API Endpoints Required
- Auth Service (port 4101)
- Profile Service (port 4102)
- Post Service (port 4103)
- Feed Service (port 4104)

## Design Considerations
- Follow Material Design 3 guidelines for Android
- Follow Human Interface Guidelines for iOS
- Ensure consistent spacing and typography
- Implement smooth animations and transitions
- Support both light and dark themes

## Success Criteria
- All Phase 1 screens implemented and functional
- API integration working with all backend services
- Tests passing with >80% coverage
- Performance metrics meeting targets (<2s initial load)
- No critical bugs or crashes
- App ready for beta testing

## Next Steps (Priority Order)

### Immediate (High Priority)
1. **API Integration**
   - Connect to backend services (Auth, Profile, Post, Feed)
   - Replace mock data with real API calls
   - Implement error handling and retry logic
   - Add loading states and skeleton screens

2. **Authentication Flow**
   - Implement login screen UI
   - Add token management and secure storage
   - Set up session management
   - Add biometric authentication

3. **State Management**
   - Complete Redux setup for real data
   - Implement data caching and offline support
   - Add optimistic updates for better UX

### Short Term (Medium Priority)
4. **Media Upload**
   - Implement actual photo/video capture
   - Add image cropping and editing
   - Connect to backend media service
   - Add upload progress indicators

5. **Real-time Features**
   - Implement WebSocket connection for live updates
   - Add push notifications
   - Real-time feed updates

6. **Search & Discovery**
   - Implement search functionality
   - Create discover/explore screen
   - Add user/content recommendations

### Medium Term (Lower Priority)
7. **Performance Optimization**
   - Implement image lazy loading
   - Add list virtualization
   - Optimize bundle size
   - Add performance monitoring

8. **Testing**
   - Write unit tests for components
   - Add integration tests
   - Implement E2E testing
   - Set up CI/CD pipeline

9. **Polish & UX**
   - Add haptic feedback
   - Implement gesture handlers
   - Add accessibility features
   - Support dark mode

10. **Deployment**
    - Configure build settings
    - Create app store assets
    - Set up beta testing
    - Prepare for production release
