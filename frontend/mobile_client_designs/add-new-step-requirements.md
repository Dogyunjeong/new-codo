# Add New Step Screen - Component Requirements

## Screen Overview
Modal screen for creating a new journey step with text, media, and emotional context.

## Component Hierarchy

### 1. CreateStepHeader
- **Location**: Top of screen
- **Elements**:
  - Close button (X icon) - left aligned
  - Title "New Journey Step" - center
  - Share button - right aligned, black background with white text
- **Styling**: Clean white background, proper spacing

### 2. JourneySelector
- **Location**: Below header
- **Elements**:
  - Avatar image (circular, 40x40)
  - Journey title "Your Hero's Journey"
  - Subtitle "Personal growth journey" (gray text)
  - Dropdown arrow icon
- **Behavior**: Tappable to select different journey
- **Styling**: Padding, border-bottom separator

### 3. StepContentInput
- **Location**: Main content area
- **Elements**:
  - Large text input with placeholder "What step would you add?"
  - Multi-line support
  - Auto-expanding height
- **Styling**: Large font, proper padding, no border

### 4. MediaToolbar
- **Location**: Below content input
- **Elements**:
  - Camera icon - Take/add photo
  - Video icon - Add video
  - Link icon - Add link
  - Image icon - Add from gallery
- **Styling**: Icon buttons with consistent spacing, gray icons

### 5. MomentSelector
- **Location**: Below media toolbar
- **Title**: "How are you feeling about this step?"
- **Options**:
  - Up Moment (😊 emoji)
    - Label: "Up Moment"
    - Description: "Victory & Progress"
  - Down Moment (😔 emoji)
    - Label: "Down Moment"  
    - Description: "Challenge & Setback"
- **Behavior**: Radio button selection (one option)
- **Styling**: Cards with emoji, title, and description

### 6. InspirationSection
- **Location**: Below moment selector
- **Title**: "What inspired this step?"
- **Elements**:
  - Add button with plus icon
  - Text: "Add inspiring post or journey"
- **Styling**: Dashed border, gray text

### 7. ReminderNote
- **Location**: Bottom of scrollable content
- **Elements**:
  - Lightbulb icon
  - Text about authentic sharing
- **Styling**: Light gray background, small text

## Design Specifications

### Colors
- Background: #FFFFFF
- Primary text: #1F2937
- Secondary text: #6B7280
- Border: #E5E7EB
- Share button: #111827
- Icons: #6B7280

### Typography
- Header title: 17px, semibold
- Journey title: 15px, medium
- Journey subtitle: 13px, regular, gray
- Input placeholder: 17px, regular, light gray
- Section titles: 15px, medium
- Card labels: 14px, medium
- Descriptions: 12px, regular, gray

### Spacing
- Screen padding: 16px horizontal
- Section spacing: 24px
- Component internal padding: 12px
- Icon spacing: 24px

### Components Needed
1. CreateStepHeader
2. JourneySelector
3. StepContentInput
4. MediaToolbar
5. MomentSelector
6. InspirationSection
7. ReminderNote
8. AddNewStepScreen (main screen assembly)