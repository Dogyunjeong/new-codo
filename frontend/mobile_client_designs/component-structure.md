# Component Structure for HeroJourney Mobile App

## Design System Analysis

### Color Palette
- **Primary Text**: #1F2937 (Dark Gray)
- **Secondary Text**: #6B7280 (Medium Gray)  
- **Tertiary Text**: #9CA3AF (Light Gray)
- **Background**: #FFFFFF (White)
- **Surface**: #F9FAFB (Light Gray Background)
- **Border**: #E5E7EB (Light Gray Border)
- **Primary Action**: #111827 (Near Black)
- **Accent**: Various colors for tags/categories

### Typography
- **App Name**: 20px, Bold
- **Screen Headers**: 17px, Semibold
- **User Names**: 15px, Semibold
- **Body Text**: 14px, Regular
- **Meta Text**: 12px, Regular
- **Small Labels**: 11px, Regular

### Spacing System
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 20px
- xxl: 24px

---

## Screen 1: Home Feed

### Component Hierarchy

```
HomeScreen
├── StatusBar
├── Header
│   ├── AppLogo
│   ├── NotificationIcon
│   └── MessagesIcon
├── StoryBar
│   └── StoryInput
├── TabBar
│   ├── ForYouTab
│   ├── FollowingTab
│   ├── CareerTab
│   └── HealingTab
└── FeedList
    └── PostCard[]
        ├── PostHeader
        │   ├── UserAvatar
        │   ├── UserInfo
        │   │   ├── UserName
        │   │   └── PostMeta
        │   └── MoreButton
        ├── PostCategories
        │   └── CategoryPill[]
        ├── PostContent
        │   ├── PostTitle
        │   ├── PostDescription
        │   └── PostSteps
        ├── PostMedia
        │   └── MediaImage
        ├── PostTags
        │   └── TagPill[]
        ├── PostEngagement
        │   ├── LikeButton
        │   ├── CommentButton
        │   └── RelateButton
        └── InspiredBySection
            ├── InspiredByAvatar
            └── InspiredByText
```

### Component Requirements

#### 1. Header
- **Height**: 44px
- **Layout**: Flexbox, space-between
- **Left**: App name "HeroJourney" (20px, Bold)
- **Right**: Bell icon, Message icon (24px icons)

#### 2. StoryBar
- **Height**: 48px
- **Background**: #F9FAFB
- **Content**: Avatar (32px) + "Share your next step..." placeholder
- **Action**: Plus button (24px, black circle)

#### 3. TabBar (Horizontal Scrollable)
- **Height**: 36px
- **Pills**: Rounded (18px radius)
- **Active**: Black background, white text
- **Inactive**: #F3F4F6 background, #6B7280 text
- **Font**: 13px, Semibold

#### 4. PostCard
- **Margin**: 12px horizontal, 16px vertical
- **Components**:
  
  a. **PostHeader**
  - Avatar: 40px circle
  - Name: 15px, Semibold, #1F2937
  - Meta: 12px, Regular, #9CA3AF
  - More button: 20px icon
  
  b. **PostCategories**
  - Pills: Height 24px, rounded
  - Font: 11px, Medium
  - Colors: Category-specific backgrounds
  
  c. **PostContent**
  - Title: 16px, Semibold
  - Description: 14px, Regular, line-height 20px
  - Steps count: 12px, #6B7280
  
  d. **PostMedia** (if exists)
  - Full width image
  - Rounded corners: 8px
  - Height: Dynamic based on aspect ratio
  
  e. **PostEngagement**
  - Icons: 20px
  - Counts: 14px, #6B7280
  - Spacing: 16px between items
  
  f. **InspiredBy** (if exists)
  - Background: #F9FAFB
  - Padding: 8px
  - Avatar: 20px
  - Text: 12px, #6B7280

---

## Screen 2: Profile

### Component Hierarchy

```
ProfileScreen
├── StatusBar
├── ProfileHeader
│   ├── ProfileAvatar
│   ├── ProfileInfo
│   │   ├── ProfileName
│   │   ├── ProfileUsername
│   │   └── ProfileBio
│   └── EditButton
├── ProfileStats
│   ├── StepsStat
│   ├── FollowingStat
│   └── FollowersStat
├── ProfileTags
│   └── TagChip[]
├── JourneySection
│   ├── SectionHeader
│   │   ├── SectionTitle
│   │   └── ViewAllButton
│   └── JourneyCardList
│       └── JourneyCard[]
│           ├── CardImage
│           ├── CardContent
│           │   ├── CardTitle
│           │   ├── CardDescription
│           │   ├── CardDate
│           │   └── CardSteps
│           └── CardStatus
└── BottomNavigation
    ├── HomeTab
    ├── AddButton (FAB)
    └── ProfileTab
```

### Component Requirements

#### 1. ProfileHeader
- **Avatar**: 64px circle
- **Name**: 18px, Bold
- **Username**: 14px, #6B7280
- **Bio**: 14px, Regular, line-height 20px
- **Edit Button**: Border 1px, rounded 6px, "Edit" text + gear icon

#### 2. ProfileStats
- **Layout**: 3 columns, equal width
- **Number**: 24px, Bold
- **Label**: 12px, #6B7280

#### 3. ProfileTags
- **Pills**: Height 28px
- **Background**: #F3F4F6
- **Text**: 13px, #4B5563

#### 4. JourneyCard
- **Layout**: Horizontal card
- **Image**: 160px width, full height, rounded 8px
- **Title**: 15px, Semibold
- **Description**: 13px, #6B7280
- **Meta**: 12px, #9CA3AF
- **Status Badge**: "Active" in green, "Ongoing" in blue

---

## Screen 3: Profile Feed (Scrolled)

### Component Hierarchy

```
ProfileFeedScreen
├── StatusBar
├── TabNavigation
│   ├── MyStepsTab
│   ├── SavedTab
│   └── RelatedTab
└── StepsList
    └── StepCard[]
        ├── StepHeader
        │   ├── StepIcon
        │   ├── StepType
        │   └── StepDate
        ├── StepContent
        │   └── StepText
        ├── StepMedia
        │   └── MediaImage
        ├── StepEngagement
        │   ├── LikeButton
        │   ├── CommentButton
        │   ├── SaveButton
        │   └── ShareButton
        └── MoreButton
```

### Component Requirements

#### 1. TabNavigation
- **Height**: 44px
- **Underline**: 2px black for active
- **Font**: 15px, Semibold

#### 2. StepCard
- **Padding**: 16px
- **Border Bottom**: 1px #E5E7EB

  a. **StepHeader**
  - Icon: 32px circle with trophy/triangle icon
  - Type: 14px, Semibold ("Breakthrough", "Challenge", "Threshold")
  - Date: 12px, #9CA3AF

  b. **StepContent**
  - Text: 14px, Regular, line-height 20px
  - Max lines: Show full text

  c. **StepMedia**
  - Full width minus padding
  - Height: 200px
  - Rounded: 8px
  - Dark overlay with white text

  d. **StepEngagement**
  - Icons: 20px
  - Counts: 14px, #6B7280
  - Layout: Like, Comment on left; Save, Share on right

---

## Common Components

### 1. BottomNavigation
- **Height**: 56px + safe area
- **Background**: White
- **Border Top**: 1px #E5E7EB
- **Icons**: 24px
- **Active**: Black
- **Inactive**: #9CA3AF
- **FAB**: 56px circle, black, white plus icon

### 2. Avatar
- **Sizes**: 
  - Small: 24px
  - Medium: 32px
  - Large: 40px
  - XLarge: 64px
- **Border**: 2px white when overlapping

### 3. Button
- **Primary**: Black background, white text
- **Secondary**: White background, black text, 1px border
- **Text**: No background, colored text
- **Heights**: Small (32px), Medium (40px), Large (48px)

### 4. Pill/Tag
- **Height**: 24px
- **Padding**: 8px horizontal
- **Border Radius**: 12px
- **Font**: 11px, Medium

### 5. Card
- **Background**: White
- **Border**: 1px #E5E7EB or shadow
- **Border Radius**: 8px
- **Padding**: 12px or 16px

### 6. Typography Components
- **Title**: 16-18px, Semibold
- **Body**: 14px, Regular
- **Caption**: 12px, Regular
- **Label**: 11px, Medium

---

## Implementation Priority

### Phase 1: Core Components
1. Design system (colors, typography, spacing)
2. Avatar component
3. Button component
4. Pill/Tag component
5. Card container

### Phase 2: Navigation
1. BottomNavigation
2. TabBar component
3. Screen headers

### Phase 3: Feed Components
1. PostCard
2. PostHeader
3. PostContent
4. PostEngagement
5. StoryBar

### Phase 4: Profile Components
1. ProfileHeader
2. ProfileStats
3. JourneyCard
4. StepCard

### Phase 5: Interactions
1. Like animations
2. Pull to refresh
3. Scroll behaviors
4. Navigation transitions