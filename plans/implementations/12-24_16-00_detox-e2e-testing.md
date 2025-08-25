# Detox E2E Test Implementation Plan for Mobile Client

**Date**: 2025-12-24  
**Feature**: E2E Testing with Detox for React Native Mobile Client
**Status**: 🚧 In Progress

## Overview
Implement comprehensive E2E testing using Detox for the Ziririt mobile client. Tests will be implemented in chunks, with each chunk tested and validated before proceeding to the next.

## Project Structure
```
/frontend/mobile_client/
├── e2e_test/
│   ├── detox/
│   │   ├── config/
│   │   │   ├── .detoxrc.js           # Detox configuration
│   │   │   └── init.js               # Test initialization
│   │   ├── helpers/
│   │   │   ├── testIds.js            # Centralized test IDs
│   │   │   ├── actions.js            # Reusable test actions
│   │   │   └── mockServer.js         # Mock backend responses
│   │   ├── tests/
│   │   │   ├── 01-auth/
│   │   │   │   ├── login.test.js
│   │   │   │   └── signup.test.js
│   │   │   ├── 02-feed/
│   │   │   │   ├── homeFeed.test.js
│   │   │   │   └── pullToRefresh.test.js
│   │   │   ├── 03-post/
│   │   │   │   ├── createPost.test.js
│   │   │   │   └── viewPost.test.js
│   │   │   ├── 04-profile/
│   │   │   │   └── viewProfile.test.js
│   │   │   └── 05-integration/
│   │   │       └── fullFlow.test.js
│   │   └── package.json              # Detox-specific dependencies
├── .detoxrc.js                       # Root Detox config (symlink)
└── package.json                       # Updated with Detox scripts
```

## Implementation Checklist

### 🔧 Chunk 1: Detox Setup & Infrastructure
**Goal**: Set up Detox with basic configuration and verify it works

#### Prerequisites
- [ ] Install Detox CLI globally: `npm install -g detox-cli`
- [ ] Install applesimutils for iOS: `brew tap wix/brew && brew install applesimutils`
- [ ] Verify Android emulator is available
- [ ] Verify iOS simulator is available

#### Implementation Tasks
- [ ] Create `/frontend/mobile_client/e2e_test/detox/` directory structure
- [ ] Create `e2e_test/detox/package.json` with Detox dependencies
- [ ] Create `e2e_test/detox/config/.detoxrc.js` with iOS and Android configurations
- [ ] Create `e2e_test/detox/config/init.js` for test setup/teardown
- [ ] Create `e2e_test/detox/helpers/testIds.js` with initial test IDs
- [ ] Update root `package.json` with E2E test scripts
- [ ] Create a simple smoke test to verify setup

#### Validation
- [ ] Run `detox build -c ios.sim.debug` successfully
- [ ] Run `detox test -c ios.sim.debug --take-screenshots all --cleanup` successfully
- [ ] Verify screenshots are generated

---

### 🔐 Chunk 2: Authentication Tests
**Goal**: Test login and signup flows with mock authentication

#### Prerequisites
- [ ] Chunk 1 completed and validated
- [ ] Mock auth enabled in `.env.development`

#### Implementation Tasks
- [ ] Add testID props to LoginScreen components:
  - [ ] Email input field
  - [ ] Password input field
  - [ ] Login button
  - [ ] Signup button
  - [ ] Google login button
  - [ ] Apple login button
  - [ ] Error message container

- [ ] Add testID props to SignupScreen components:
  - [ ] Name input field
  - [ ] Email input field
  - [ ] Password input field
  - [ ] Confirm password field
  - [ ] Signup button
  - [ ] Back button

- [ ] Create `e2e_test/detox/tests/01-auth/login.test.js`:
  - [ ] Test successful mock login
  - [ ] Test email validation
  - [ ] Test password validation
  - [ ] Test navigation to home after login
  - [ ] Test error message display

- [ ] Create `e2e_test/detox/tests/01-auth/signup.test.js`:
  - [ ] Test successful signup flow
  - [ ] Test form validation
  - [ ] Test password matching
  - [ ] Test navigation after signup

- [ ] Create `e2e_test/detox/helpers/actions.js` with auth helpers:
  - [ ] `login(email, password)` helper
  - [ ] `signup(name, email, password)` helper
  - [ ] `logout()` helper

#### Validation
- [ ] Run `npm run e2e:test:auth` successfully
- [ ] All auth tests pass
- [ ] Screenshots captured for failures

---

### 📱 Chunk 3: Feed Tests
**Goal**: Test home feed display and interactions

#### Prerequisites
- [ ] Chunk 2 completed and validated
- [ ] User can login successfully

#### Implementation Tasks
- [ ] Add testID props to Feed components:
  - [ ] FlatList/ScrollView
  - [ ] PostCard components
  - [ ] TabBar
  - [ ] RefreshControl
  - [ ] Story bar
  - [ ] Like button
  - [ ] Comment button

- [ ] Create `e2e_test/detox/tests/02-feed/homeFeed.test.js`:
  - [ ] Test feed loads after login
  - [ ] Test post cards display
  - [ ] Test scroll to bottom
  - [ ] Test tab switching
  - [ ] Test story bar display

- [ ] Create `e2e_test/detox/tests/02-feed/pullToRefresh.test.js`:
  - [ ] Test pull-to-refresh gesture
  - [ ] Test loading indicator appears
  - [ ] Test feed updates after refresh
  - [ ] Test error handling

- [ ] Update `helpers/mockServer.js`:
  - [ ] Add mock feed data
  - [ ] Add mock post responses
  - [ ] Add delay simulation

#### Validation
- [ ] Run `npm run e2e:test:feed` successfully
- [ ] Feed displays mock data correctly
- [ ] Refresh functionality works

---

### ✏️ Chunk 4: Post Creation Tests
**Goal**: Test creating and viewing posts

#### Prerequisites
- [ ] Chunk 3 completed and validated
- [ ] Feed displays correctly

#### Implementation Tasks
- [ ] Add testID props to CreatePost components:
  - [ ] Create button/FAB
  - [ ] Text input field
  - [ ] Media picker button
  - [ ] Category selector
  - [ ] Submit button
  - [ ] Cancel button

- [ ] Create `e2e_test/detox/tests/03-post/createPost.test.js`:
  - [ ] Test navigate to create post
  - [ ] Test text input
  - [ ] Test category selection
  - [ ] Test submit post
  - [ ] Test post appears in feed
  - [ ] Test cancel flow

- [ ] Create `e2e_test/detox/tests/03-post/viewPost.test.js`:
  - [ ] Test tap on post card
  - [ ] Test post details display
  - [ ] Test like action
  - [ ] Test comment action
  - [ ] Test back navigation

- [ ] Update helpers:
  - [ ] Add `createPost(content, category)` helper
  - [ ] Add `likePost(postId)` helper
  - [ ] Add `commentOnPost(postId, comment)` helper

#### Validation
- [ ] Run `npm run e2e:test:post` successfully
- [ ] Post creation flow works end-to-end
- [ ] Post appears in feed after creation

---

### 👤 Chunk 5: Profile Tests
**Goal**: Test profile viewing and interactions

#### Prerequisites
- [ ] Chunk 4 completed and validated
- [ ] User has created posts

#### Implementation Tasks
- [ ] Add testID props to Profile components:
  - [ ] Profile header
  - [ ] Stats section
  - [ ] Journey cards
  - [ ] Posts grid
  - [ ] Follow button
  - [ ] Edit button

- [ ] Create `e2e_test/detox/tests/04-profile/viewProfile.test.js`:
  - [ ] Test navigate to profile tab
  - [ ] Test profile data displays
  - [ ] Test stats are correct
  - [ ] Test journey cards display
  - [ ] Test posts grid shows user posts
  - [ ] Test tap on post navigates

- [ ] Update helpers:
  - [ ] Add `navigateToProfile()` helper
  - [ ] Add `followUser(userId)` helper

#### Validation
- [ ] Run `npm run e2e:test:profile` successfully
- [ ] Profile displays user data correctly
- [ ] Navigation between screens works

---

### 🔄 Chunk 6: Integration Tests
**Goal**: Test complete user journeys

#### Prerequisites
- [ ] All previous chunks completed
- [ ] All individual features work

#### Implementation Tasks
- [ ] Create `e2e_test/detox/tests/05-integration/fullFlow.test.js`:
  - [ ] Test complete new user journey:
    - [ ] Signup
    - [ ] View onboarding
    - [ ] View empty feed
    - [ ] Create first post
    - [ ] View post in feed
    - [ ] Navigate to profile
    - [ ] Logout
  
  - [ ] Test returning user journey:
    - [ ] Login
    - [ ] View feed with posts
    - [ ] Create new post
    - [ ] Like another user's post
    - [ ] View profile
    - [ ] Logout

- [ ] Create test data fixtures:
  - [ ] Sample users
  - [ ] Sample posts
  - [ ] Sample interactions

#### Validation
- [ ] Run `npm run e2e:test:all` successfully
- [ ] All integration tests pass
- [ ] Generate test report

---

## Helper Files Structure

### testIds.js
```javascript
export const testIDs = {
  auth: {
    emailInput: 'auth-email-input',
    passwordInput: 'auth-password-input',
    loginButton: 'auth-login-button',
    signupButton: 'auth-signup-button',
    googleButton: 'auth-google-button',
    appleButton: 'auth-apple-button',
    errorMessage: 'auth-error-message'
  },
  feed: {
    feedList: 'feed-list',
    postCard: (id) => `post-card-${id}`,
    refreshControl: 'feed-refresh',
    tabBar: 'feed-tab-bar',
    tab: (name) => `tab-${name}`
  },
  post: {
    createButton: 'post-create-button',
    textInput: 'post-text-input',
    submitButton: 'post-submit-button',
    cancelButton: 'post-cancel-button'
  },
  profile: {
    header: 'profile-header',
    stats: 'profile-stats',
    postsGrid: 'profile-posts-grid',
    followButton: 'profile-follow-button'
  }
}
```

### Package.json Scripts
```json
{
  "scripts": {
    "e2e:build:ios": "detox build -c ios.sim.debug",
    "e2e:build:android": "detox build -c android.emu.debug",
    "e2e:test:ios": "detox test -c ios.sim.debug",
    "e2e:test:android": "detox test -c android.emu.debug",
    "e2e:test:auth": "detox test e2e_test/detox/tests/01-auth -c ios.sim.debug",
    "e2e:test:feed": "detox test e2e_test/detox/tests/02-feed -c ios.sim.debug",
    "e2e:test:post": "detox test e2e_test/detox/tests/03-post -c ios.sim.debug",
    "e2e:test:profile": "detox test e2e_test/detox/tests/04-profile -c ios.sim.debug",
    "e2e:test:integration": "detox test e2e_test/detox/tests/05-integration -c ios.sim.debug",
    "e2e:test:all": "detox test -c ios.sim.debug --take-screenshots all",
    "e2e:clean": "detox clean-framework-cache && detox build-framework-cache"
  }
}
```

## Success Metrics

### Per Chunk Success Criteria
- **Chunk 1**: ✅ Detox installed, configured, and runs a basic test
- **Chunk 2**: ✅ Auth flows work, proper error handling, navigation succeeds
- **Chunk 3**: ✅ Feed loads, displays data, refresh works
- **Chunk 4**: ✅ Posts can be created and appear in feed
- **Chunk 5**: ✅ Profile displays correctly with user data
- **Chunk 6**: ✅ Complete user journeys pass end-to-end

### Overall Success Metrics
- [ ] All tests pass on iOS simulator
- [ ] All tests pass on Android emulator
- [ ] Test execution time < 5 minutes for full suite
- [ ] Screenshot artifacts generated for failures
- [ ] Test coverage > 80% of critical user paths
- [ ] Tests are maintainable and well-documented

## Troubleshooting Guide

### Common Issues
1. **Build Failures**
   - Clean build: `cd ios && rm -rf build && pod install`
   - Reset Metro: `npx react-native start --reset-cache`

2. **Test Timeouts**
   - Increase timeout in .detoxrc.js
   - Check simulator/emulator performance
   - Verify mock server responses

3. **Element Not Found**
   - Verify testID is added to component
   - Check if element is visible on screen
   - Add waitFor() before interaction

4. **Flaky Tests**
   - Add explicit waits
   - Mock network responses
   - Disable animations in test mode

## Next Steps After Implementation

1. **CI/CD Integration**
   - Set up GitHub Actions workflow
   - Run tests on PR
   - Generate test reports

2. **Performance Testing**
   - Add performance metrics collection
   - Monitor app launch time
   - Track screen transition times

3. **Visual Regression Testing**
   - Integrate with Percy or Applitools
   - Capture UI screenshots
   - Compare against baselines

4. **Accessibility Testing**
   - Add accessibility IDs
   - Test with screen readers
   - Verify WCAG compliance