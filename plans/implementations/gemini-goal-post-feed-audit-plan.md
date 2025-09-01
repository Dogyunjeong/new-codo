### Implementation Plan: Full-Stack API and UI Audit (Gemini)

This document outlines the step-by-step plan to investigate, audit, and fix the APIs and UIs for Goals, Posts, and Feeds.

---

### Phase 1: Goal Domain (Profile Service & Mobile UI)

**Backend Checks (Domain: `ziririt-profile-service`)**
-   **[ ] 1.1: Audit Goal Creation Logic**
    -   **File**: `backend/ziririt-profile-service/src/controllers/`
    -   **Logic**: Verify data validation and user association.
-   **[ ] 1.2: Audit Goal Retrieval (Read)**
    -   **File**: `backend/ziririt-profile-service/src/controllers/`
    -   **Logic**: Check correct user ownership and data serialization.
-   **[ ] 1.3: Audit Goal Update & "Stop Goal" Logic**
    -   **File**: `backend/ziririt-profile-service/src/controllers/`
    -   **Logic**: Confirm owner-only updates and correct status transitions.
-   **[ ] 1.4: Audit Goal Deletion Logic**
    -   **File**: `backend/ziririt-profile-service/src/controllers/`
    -   **Logic**: Ensure proper authorization.

**Frontend Checks (Domain: `mobile_client`)**
-   **[ ] 1.5: Audit Goal Creation UI**
    -   **File**: `frontend/mobile_client/app/(tabs)/profile/` and `components/goals/`
    -   **Logic**: Check the goal creation form, its API call, and loading/error state handling.
-   **[ ] 1.6: Audit Goal Display & Interaction UI**
    -   **File**: `frontend/mobile_client/app/(tabs)/profile/` and `components/goals/`
    -   **Logic**: Verify goals are displayed correctly and that "Stop Goal" and "Delete" buttons function and update the UI.

---

### Phase 2: Post Domain (Post Service & Mobile UI)

**Backend Checks (Domain: `ziririt-post-service`)**
-   **[ ] 2.1: Audit Post Creation Logic**
    -   **File**: `backend/ziririt-post-service/src/controllers/`
    -   **Logic**: Validate data and user/goal association.
-   **[ ] 2.2: Audit Post Retrieval (Read)**
    -   **File**: `backend/ziririt-post-service/src/controllers/`
    -   **Logic**: Verify fetching of single and multiple posts.
-   **[ ] 2.3: Audit Post Update Logic**
    -   **File**: `backend/ziririt-post-service/src/controllers/`
    -   **Logic**: Ensure owner-only edits.
-   **[ ] 2.4: Audit Post Deletion Logic**
    -   **File**: `backend/ziririt-post-service/src/controllers/`
    -   **Logic**: Check authorization and side effects (e.g., feed removal).

**Frontend Checks (Domain: `mobile_client`)**
-   **[ ] 2.5: Audit Post Creation UI**
    -   **File**: `frontend/mobile_client/app/post/create.tsx` (or similar) and `components/posts/`
    -   **Logic**: Check the post creation form, its link to a goal, and the API call.
-   **[ ] 2.6: Audit Post Display UI**
    -   **File**: `frontend/mobile_client/components/posts/PostCard.tsx` (or similar)
    -   **Logic**: Verify how posts are rendered in feeds or profiles, including comments and likes.

---

### Phase 3: Feed Domain (Feed Service & Mobile UI)

**Backend Checks (Domain: `ziririt-feed-service`)**
-   **[ ] 3.1: Audit Feed Generation Logic**
    -   **File**: `backend/ziririt-feed-service/src/services/`
    -   **Logic**: Investigate feed assembly, personalization, and ordering.
-   **[ ] 3.2: Audit Feed Caching & Retrieval**
    -   **File**: `backend/ziririt-feed-service/src/controllers/` and `services/`
    -   **Logic**: Analyze Redis caching, invalidation, and pagination.
-   **[ ] 3.3: Audit Feed Update & Deletion Logic**
    -   **File**: `backend/ziririt-feed-service/src/`
    -   **Logic**: Check how new posts are added and deleted posts are removed, including any inter-service communication.

**Frontend Checks (Domain: `mobile_client`)**
-   **[ ] 3.4: Audit Feed Screen UI**
    -   **File**: `frontend/mobile_client/app/(tabs)/index.tsx` (or home screen)
    -   **Logic**: Verify feed loading, infinite scroll/pagination, and pull-to-refresh.
-   **[ ] 3.5: Audit Feed Interaction UI**
    -   **File**: `frontend/mobile_client/components/posts/PostCard.tsx`
    -   **Logic**: Check that interactions within the feed (liking, commenting, navigation) work as expected and provide immediate UI feedback.