# API Logic Check Report - Full Stack Analysis by Domain

## Executive Summary
Comprehensive analysis of Goal, Post, and Feed domains across both backend services and frontend mobile client. Each domain analyzed for end-to-end functionality from API to UI.

## 1. Goal Domain (Profile Service + Mobile Client)

### Backend Issues:
1. **Type Mismatch**: GoalManagementService uses local Goal interface instead of shared types
   - File: `backend/ziririt-profile-service/src/api/goal/GoalManagement.service.mts`
   - Should import from `@base/shared-types/goals/Goal.type.mts`

2. **Missing Field**: Database has `steps_count` but not in service interface
   - Database schema includes `steps_count INTEGER DEFAULT 0`
   - Service Goal interface missing this field

3. **Inconsistent Error Responses**: Mix of error formats
   - Some return `{ error: string }`
   - Others return `{ error: string, message: string }`

### Frontend Issues:
1. **Screen Implementation Gaps**:
   - `create-journey.tsx` exists but not functional
   - `goal-detail.tsx` created but not linked in navigation
   - Profile screen missing goal management features
   - Journey tab shows static UI only

2. **Service Integration**:
   - ProfileService created but not integrated
   - No goal CRUD operations from mobile
   - Missing goal creation flow connection

3. **Type Mismatches**:
   - Frontend defines own types in ProfileService.ts
   - Should use `@base/shared-types/goals/Goal.type.mts`

### API Status:
- ✅ Backend CREATE: POST /api/goals - Working
- ❌ Frontend CREATE: No integration
- ✅ Backend READ: GET /api/goals/:id, GET /api/goals/user/:userId
- ❌ Frontend READ: Not fetching real data
- ✅ Backend UPDATE: PUT /api/goals/:id
- ❌ Frontend UPDATE: No edit UI
- ✅ Backend DELETE: DELETE /api/goals/:id
- ❌ Frontend DELETE: No delete functionality
- ⚠️ Missing: Batch operations, search functionality

### End-to-End Flow Status:
- ❌ Goal Creation: UI exists but not connected to backend
- ❌ Goal Display: Journey screen shows mock data
- ❌ Goal Management: Can't edit/delete from mobile
- ❌ Goal Progress: Steps tracking not implemented

## 2. Post Domain (Post Service + Mobile Client)

### Backend Issues:
1. **Type Duplication**: Separate types in service vs shared-types
   - Service defines own types in `backend/ziririt-post-service/src/types/post.types.mts`
   - Should use `@base/shared-types/post/PostBasic.type.mts`

2. **Authentication Inconsistency**: 
   - Main routes use Firebase auth middleware
   - Interaction routes use mock auth (hardcoded user ID)
   - File: `backend/ziririt-post-service/src/api/interaction/interaction.routes.mts:35`

3. **Missing Validation**: No UUID validation for user/goal IDs in handlers

4. **Deprecated Routes**: Interaction routes show deprecation but still active
   - `/api/interactions/*` routes deprecated
   - Should use `/api/posts/:postId/*` pattern

### Frontend Issues:
1. **Screen Implementation**:
   - `create-step.tsx` exists but doesn't associate with goals
   - No post display in feed after creation
   - Missing media upload UI

2. **Service Integration**:
   - PostService.ts created but not used
   - No connection to create-step screen
   - Missing like/comment functionality

3. **Type Issues**:
   - Frontend PostService defines own types
   - Should use `@base/shared-types/post/PostBasic.type.mts`

### API Status:
- ✅ Backend CREATE: POST /api/posts
- ❌ Frontend CREATE: UI exists, not connected
- ✅ Backend READ: GET /api/posts/:id, GET /api/posts/user/:userId
- ❌ Frontend READ: Not fetching posts
- ✅ Backend UPDATE: PUT /api/posts/:id
- ❌ Frontend UPDATE: No edit capability
- ✅ Backend DELETE: DELETE /api/posts/:id
- ❌ Frontend DELETE: No delete option
- ⚠️ Backend INTERACTIONS: Working but auth issue
- ❌ Frontend INTERACTIONS: Not implemented
- ❌ Media Upload: Not implemented either side

### End-to-End Flow Status:
- ❌ Post Creation: Create step screen not functional
- ❌ Post Display: Not showing in feeds
- ❌ Interactions: Can't like/comment from mobile
- ❌ Media: No image/video support

## 3. Feed Domain (Feed Service + Mobile Client)

### Backend Issues:
1. **Route Mismatch**: Routes file uses different format than handler
   - Routes: `feed.routes.mts` uses old format
   - Handler: `feed.handler.mts` expects different structure
   - Constructor mismatch - handler expects dependencies object

2. **Missing Discover Endpoint**: No `/api/feed/discover` route defined
   - Handler has methods for hashtag and user feeds
   - Routes only expose home and goal timeline

3. **Cache Key Generation**: Missing method in cache service
   - `generateCacheKey` method called but not defined
   - File: `backend/ziririt-feed-service/src/api/feed/feedCache.service.mts`

4. **User ID Extraction**: Using non-standard header
   - Uses `x-user-id` header instead of auth middleware
   - Should integrate with Firebase auth like other services

### Frontend Issues:
1. **Screen Implementation**:
   - Home feed shows static mock data
   - Not pulling from backend feed service
   - No pull-to-refresh functionality
   - Missing infinite scroll

2. **Service Integration**:
   - FeedService.ts created but not integrated
   - No connection to home screen
   - Missing personalization

3. **Type Issues**:
   - Frontend not using shared feed types
   - Should align with backend feed structure

### API Status:
- ⚠️ Backend READ: GET /api/feed/home - Working but auth issue
- ❌ Frontend READ: Shows mock data only
- ⚠️ Backend READ: GET /api/feed/goal/:goalId
- ❌ Frontend READ: Not implemented
- ❌ Backend READ: GET /api/feed/discover - Not exposed
- ❌ Frontend READ: No discover feature
- ✅ Backend REFRESH: POST /api/feed/refresh
- ❌ Frontend REFRESH: No pull-to-refresh

### End-to-End Flow Status:
- ❌ Home Feed: Static data, not personalized
- ❌ Goal Feed: Not accessible from mobile
- ❌ Discover: Feature not available
- ❌ Real-time Updates: No feed refresh

## 4. Authentication & Infrastructure

### Authentication Issues:
1. **Backend Problems**:
   - Mock auth in interaction routes (critical security issue)
   - Inconsistent middleware across services
   - Feed service uses custom header instead of Firebase

2. **Frontend Problems**:
   - Auth token not propagated to all API calls
   - PostService and ProfileService missing auth headers
   - No token refresh logic

### Infrastructure Issues:
1. **Port Mismatch**: 
   - Gateway listens on 4100
   - Mobile client expects 8080
   - Services configured differently

2. **Route Duplication**:
   - Both `/api/*` and legacy routes active
   - Could cause confusion

3. **Error Handling**:
   - No consistent error format
   - Frontend lacks network error handling
   - No retry logic for failed requests

## 5. Implementation Priority Matrix

### Critical (Security & Auth) - Day 1-2:
| Domain | Backend Task | Frontend Task |
|--------|-------------|---------------|
| All | Fix mock auth in interactions | Add auth headers to all services |
| All | Add Firebase middleware to feed | Implement token refresh |
| All | Remove hardcoded user IDs | Add auth context usage |

### High Priority (Core Flows) - Day 3-5:
| Domain | Backend Task | Frontend Task |
|--------|-------------|---------------|
| Goal | Align types to shared-types | Connect ProfileService to screens |
| Goal | Fix error response format | Implement goal creation flow |
| Post | Remove deprecated routes | Connect PostService to create-step |
| Post | Fix interaction auth | Add like/comment UI |
| Feed | Fix cache key generation | Integrate FeedService with home |
| Feed | Add discover endpoint | Implement pull-to-refresh |

### Medium Priority (Features) - Day 6-8:
| Domain | Backend Task | Frontend Task |
|--------|-------------|---------------|
| Goal | Add batch operations | Add goal management UI |
| Goal | Implement search | Add goal detail navigation |
| Post | Add media upload | Implement image picker |
| Post | Add hashtag search | Add post editing |
| Feed | Implement personalization | Add infinite scroll |
| Feed | Optimize caching | Add feed filters |

### Low Priority (Polish) - Day 9-10:
| Domain | Backend Task | Frontend Task |
|--------|-------------|---------------|
| All | Standardize logging | Add loading skeletons |
| All | Add rate limiting | Implement offline mode |
| All | Performance monitoring | Add analytics |
| All | Documentation | Error boundaries |

## 6. Success Metrics by Domain

### Goal Domain Success:
- [ ] User can create goals from mobile
- [ ] Goals appear in journey screen
- [ ] Goal progress tracking works
- [ ] Goal privacy settings enforced
- [ ] Search and filter goals

### Post Domain Success:
- [ ] Create posts with goal association
- [ ] Posts appear in relevant feeds
- [ ] Like/comment functionality works
- [ ] Media upload functional
- [ ] Edit/delete own posts

### Feed Domain Success:
- [ ] Home feed shows personalized content
- [ ] Goal feeds show relevant posts
- [ ] Discover feed available
- [ ] Real-time updates work
- [ ] Pagination/infinite scroll

### Authentication Success:
- [ ] No mock auth in production
- [ ] Consistent auth across services
- [ ] Token refresh works
- [ ] Secure API calls
- [ ] User context available

## 7. Testing Requirements by Domain

### Goal Domain Tests:
- Backend: Goal CRUD with auth, privacy, pagination
- Frontend: E2E goal creation flow
- Integration: Goal → Post association

### Post Domain Tests:
- Backend: Post CRUD, interactions, media
- Frontend: E2E post creation with goal
- Integration: Post → Feed generation

### Feed Domain Tests:
- Backend: Feed algorithms, caching, pagination
- Frontend: E2E feed refresh, infinite scroll
- Integration: Personalization logic

### Authentication Tests:
- Backend: Token validation, middleware
- Frontend: Login/logout, token refresh
- Integration: Auth propagation

## 8. Next Steps - Week Plan

### Monday-Tuesday (Auth & Security):
1. Fix all mock auth issues
2. Implement Firebase middleware consistently
3. Add auth headers to frontend services
4. Test auth flow end-to-end

### Wednesday-Thursday (Goal Domain):
1. Align backend/frontend types
2. Connect ProfileService to UI
3. Implement goal CRUD flow
4. Test goal creation end-to-end

### Friday-Saturday (Post Domain):
1. Connect PostService to UI
2. Fix interaction routes
3. Implement post creation flow
4. Add like/comment functionality

### Sunday-Monday (Feed Domain):
1. Fix feed service issues
2. Connect FeedService to UI
3. Implement feed refresh
4. Add personalization

### Tuesday (Testing & Polish):
1. Run E2E test suite
2. Fix discovered issues
3. Performance testing
4. Documentation update

---

Generated: 2025-09-01
Status: Reorganized by domain for comprehensive full-stack tracking