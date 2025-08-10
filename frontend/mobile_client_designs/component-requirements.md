# Component Implementation Requirements

## Core Design System Components

### 1. Avatar Component
**File**: `src/components/common/Avatar.tsx`

**Props**:
```typescript
interface AvatarProps {
  size: 'small' | 'medium' | 'large' | 'xlarge'
  src?: string
  name?: string // For fallback initials
  border?: boolean
  online?: boolean
}
```

**Requirements**:
- Sizes: small (24px), medium (32px), large (40px), xlarge (64px)
- Fallback: Show initials if no image
- Border: Optional 2px white border
- Online indicator: Green dot in corner
- Loading state: Skeleton circle
- Error state: Default avatar icon

---

### 2. Button Component
**File**: `src/components/common/Button.tsx`

**Props**:
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'text'
  size: 'small' | 'medium' | 'large'
  icon?: IconName
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  loading?: boolean
  disabled?: boolean
  onPress: () => void
  children: ReactNode
}
```

**Requirements**:
- Primary: Black (#111827) bg, white text
- Secondary: White bg, black text, 1px border
- Text: No bg, colored text only
- Heights: small (32px), medium (40px), large (48px)
- Ripple effect on press
- Loading spinner replaces content

---

### 3. Pill/Tag Component
**File**: `src/components/common/Pill.tsx`

**Props**:
```typescript
interface PillProps {
  label: string
  color?: string
  backgroundColor?: string
  active?: boolean
  onPress?: () => void
  size?: 'small' | 'medium'
}
```

**Requirements**:
- Height: 24px (small), 28px (medium)
- Padding: 8px horizontal
- Border radius: Full (999px)
- Font: 11px Medium (small), 13px Medium (medium)
- Active state: Inverted colors
- Press animation: Scale 0.95

---

## Feed Components

### 4. PostCard Component
**File**: `src/components/feed/PostCard.tsx`

**Props**:
```typescript
interface PostCardProps {
  post: {
    id: string
    user: {
      name: string
      avatar?: string
      meta: string // "Career • 2h ago"
    }
    categories: Array<{label: string; color: string}>
    title: string
    content: string
    steps?: string
    media?: string
    tags?: Array<{label: string; type: string}>
    engagement: {
      likes: number
      comments: number
      relates: number
      isLiked: boolean
      isRelated: boolean
    }
    inspiredBy?: {
      user: string
      avatar?: string
    }
  }
  onLike: () => void
  onComment: () => void
  onRelate: () => void
  onMore: () => void
}
```

**Requirements**:
- White background
- No border/shadow (separator line only)
- Padding: 16px
- Sections stack vertically with proper spacing
- Image full width minus padding
- Inspired section: Gray background

**Sub-components**:
- PostHeader
- PostCategories  
- PostContent
- PostMedia
- PostTags
- PostEngagement
- InspiredBySection

---

### 5. StoryBar Component
**File**: `src/components/feed/StoryBar.tsx`

**Props**:
```typescript
interface StoryBarProps {
  onAddStep: () => void
  userAvatar?: string
}
```

**Requirements**:
- Height: 48px
- Background: #F9FAFB
- Avatar: 32px
- Plus button: 24px black circle, white icon
- Placeholder text: #9CA3AF

---

### 6. TabBar Component
**File**: `src/components/common/TabBar.tsx`

**Props**:
```typescript
interface TabBarProps {
  tabs: Array<{
    id: string
    label: string
    count?: number
  }>
  activeTab: string
  onTabPress: (id: string) => void
  scrollable?: boolean
}
```

**Requirements**:
- Height: 36px
- Pill style tabs
- Active: Black bg, white text
- Inactive: #F3F4F6 bg, #6B7280 text
- Horizontal scroll if scrollable
- Smooth transition animations

---

## Profile Components

### 7. ProfileHeader Component
**File**: `src/components/profile/ProfileHeader.tsx`

**Props**:
```typescript
interface ProfileHeaderProps {
  user: {
    avatar?: string
    name: string
    username: string
    bio: string
  }
  onEdit: () => void
}
```

**Requirements**:
- Avatar: 64px
- Name: 18px Bold
- Username: 14px #6B7280
- Bio: 14px Regular, multi-line
- Edit button: Border style with icon

---

### 8. ProfileStats Component
**File**: `src/components/profile/ProfileStats.tsx`

**Props**:
```typescript
interface ProfileStatsProps {
  stats: {
    steps: number
    following: number
    followers: number
  }
  onStatPress: (stat: 'steps' | 'following' | 'followers') => void
}
```

**Requirements**:
- 3 equal columns
- Number: 24px Bold
- Label: 12px #6B7280
- Tap animation

---

### 9. JourneyCard Component
**File**: `src/components/profile/JourneyCard.tsx`

**Props**:
```typescript
interface JourneyCardProps {
  journey: {
    id: string
    image: string
    title: string
    description: string
    date: string
    steps: number
    status: 'Active' | 'Ongoing' | 'Completed'
  }
  onPress: () => void
}
```

**Requirements**:
- Horizontal layout
- Image: 160px width, aspect ratio maintained
- Status badge colors:
  - Active: Green
  - Ongoing: Blue
  - Completed: Gray
- Border radius: 8px

---

### 10. StepCard Component
**File**: `src/components/profile/StepCard.tsx`

**Props**:
```typescript
interface StepCardProps {
  step: {
    id: string
    type: 'Breakthrough' | 'Challenge' | 'Threshold'
    date: string
    content: string
    media?: {
      image: string
      caption?: string
    }
    engagement: {
      likes: number
      comments: number
      isLiked: boolean
      isSaved: boolean
    }
  }
  onLike: () => void
  onComment: () => void
  onSave: () => void
  onShare: () => void
  onMore: () => void
}
```

**Requirements**:
- Icon based on type:
  - Breakthrough: Trophy (gold)
  - Challenge: Triangle (orange)
  - Threshold: Door (purple)
- Full content display (no truncation)
- Media: Full width, 200px height
- Dark overlay on media with white text

---

## Navigation Components

### 11. BottomNavigation Component
**File**: `src/components/navigation/BottomNavigation.tsx`

**Props**:
```typescript
interface BottomNavigationProps {
  activeTab: 'home' | 'discover' | 'journey' | 'profile'
  onTabPress: (tab: string) => void
  onAddPress: () => void
}
```

**Requirements**:
- Height: 56px + safe area
- Background: White
- Border top: 1px #E5E7EB
- Icons: 24px
- Active: Black (#111827)
- Inactive: #9CA3AF
- FAB: 56px circle, centered

---

## Screen Components

### 12. HomeScreen Component
**File**: `src/screens/HomeScreen.tsx`

**Structure**:
```
- StatusBar
- Header (with notifications)
- StoryBar
- TabBar (For You, Following, Career, Healing)
- FeedList (FlatList of PostCards)
- BottomNavigation
```

**Requirements**:
- Pull to refresh
- Infinite scroll
- Skeleton loading
- Empty state

---

### 13. ProfileScreen Component
**File**: `src/screens/ProfileScreen.tsx`

**Structure**:
```
- StatusBar
- ProfileHeader
- ProfileStats
- ProfileTags
- JourneySection
- BottomNavigation
```

**Requirements**:
- Animated header on scroll
- Tab switching animation
- Pull to refresh

---

## Utility Components

### 14. Skeleton Component
**File**: `src/components/common/Skeleton.tsx`

**Props**:
```typescript
interface SkeletonProps {
  variant: 'text' | 'circular' | 'rectangular'
  width?: number | string
  height?: number | string
  animation?: boolean
}
```

---

### 15. EmptyState Component
**File**: `src/components/common/EmptyState.tsx`

**Props**:
```typescript
interface EmptyStateProps {
  icon?: IconName
  title: string
  description?: string
  action?: {
    label: string
    onPress: () => void
  }
}
```

---

## Animation Requirements

### Interactions
- **Tap**: Scale to 0.95 with spring animation
- **Like**: Heart scales up to 1.2 then back with bounce
- **Navigation**: Slide transitions between screens
- **Tab Switch**: Fade and slide content
- **Pull to Refresh**: Bounce animation
- **Scroll**: Parallax on images, fade on headers

### Timing
- **Quick**: 150ms (taps, likes)
- **Normal**: 250ms (navigation, modals)
- **Slow**: 350ms (complex transitions)

---

## Performance Requirements

- **FlatList**: Use getItemLayout for fixed heights
- **Images**: Lazy load with progressive enhancement
- **Animations**: Use native driver where possible
- **Memoization**: React.memo for expensive components
- **Virtualization**: For long lists (>50 items)

---

## Accessibility Requirements

- **Labels**: All interactive elements
- **Roles**: Proper ARIA roles
- **Contrast**: WCAG AA compliance
- **Font Scaling**: Support system font size
- **Screen Reader**: Full support

---

## Testing Requirements

- **Unit Tests**: All utility functions
- **Component Tests**: Isolated component behavior
- **Integration Tests**: Screen flows
- **Snapshot Tests**: Visual regression
- **E2E Tests**: Critical user journeys