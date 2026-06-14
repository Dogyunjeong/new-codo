# Frontend Development Guidelines

## **requirements**

=

## Project Structure

### Component Organization

#### Main Components

- Located in `/frontend/wjl-client/app/components/`
- Each main component should have its own directory
- Example: `/components/Home/LearningPathHome/`

#### Sub-components (Fragments)

- **IMPORTANT**: Always use `fragments/` directory for sub-components, NOT `components/`
- Sub-components of a main component should be placed in a `fragments/` subdirectory
- Example structure:
  ```
  /components/Home/LearningPathHome/
    ├── LearningPathHome.tsx       # Main component
    ├── fragments/                  # Sub-components directory
    │   ├── LearningPathHeader.tsx
    │   ├── ModuleCard.tsx
    │   ├── ProgressBar.tsx
    │   ├── SettingsDrawer.tsx
    │   └── index.ts               # Barrel export
    └── index.ts                   # Main export
  ```

### Hook Organization

#### Location and Structure
- **ALL hooks MUST be placed in `/app/hooks/` directory**
- Never place hooks inside component directories
- Component-specific hooks should mirror the component folder structure

#### Directory Structure Examples
```
/app/
├── components/
│   └── Activity/
│       └── Activity.Display.tsx
└── hooks/
    └── Activity/
        └── useActivityPlayer.tsx
```

#### Naming and Organization Rules
1. **General hooks**: Place directly in `/app/hooks/` (e.g., `useWordDefinitions.tsx`)
2. **Domain-specific hooks**: Group in subdirectories (e.g., `/app/hooks/learningDialogue/`)
3. **Component-specific hooks**: Mirror component path (e.g., `/app/hooks/Activity/` for `/components/Activity/`)
4. **Shared hooks**: Place in `/app/hooks/shared/`

### Naming Conventions

#### Files and Directories

- Component files: PascalCase (e.g., `LearningPathHome.tsx`)
- Fragment files: PascalCase (e.g., `ModuleCard.tsx`)
- Utility files: camelCase (e.g., `formatDate.ts`)
- Hook files: camelCase starting with 'use' (e.g., `useTranslation.ts`)

#### Imports

- Import fragments using barrel exports:
  ```typescript
  import { Header, Footer, Sidebar } from './fragments';
  ```

#### Exports

- use export default for component with same name as filename.
  ```typescript
  export default Header;
  ```
- one file could have multiple component if the concern is matched

## React & TypeScript Guidelines

### Component Structure

1. Use functional components with TypeScript
2. Define interfaces for props
3. Export components as default or named exports consistently
4. Use React.FC type for components

### State Management

- Use React hooks (useState, useEffect, useMemo, etc.)
- Extract complex logic into custom hooks
- Keep state as close to where it's needed as possible

### Performance

- Use React.memo for expensive components
- Use useMemo and useCallback appropriately
- Lazy load components when necessary

## Styling Guidelines

### Tailwind CSS

- Primary styling method
- Use utility classes directly in JSX
- Avoid inline styles unless dynamic
- Use `clsx` for conditional classes

### Dark Mode

- Always provide dark mode variants
- Use `dark:` prefix for dark mode styles
- Example: `bg-white dark:bg-gray-900`

## Internationalization (i18n)

### Translation Keys

- Store translations in `/public/locales/[locale]/`
- Use semantic, hierarchical keys
- Group related translations together
- Example structure:
  ```json
  {
    "header": {
      "title": "Welcome",
      "subtitle": "Start learning today"
    },
    "module": {
      "untitled": "Untitled Module",
      "level": "Level {{level}}"
    }
  }
  ```

### Usage

- Always use translation hook: `useTranslation()`
- Never hardcode user-facing text
- Use interpolation for dynamic values

## Code Quality

### TypeScript

- Enable strict mode
- Define types for all props and state
- Avoid using `any` type
- Use proper generic types

### Best Practices

1. Keep components focused and single-purpose
2. Extract reusable logic into hooks
3. Use proper error boundaries
4. Handle loading and error states
5. Write self-documenting code

## Testing

- Write unit tests for utility functions
- Write integration tests for complex components
- Use React Testing Library
- Follow AAA pattern (Arrange, Act, Assert)

## Accessibility

- Use semantic HTML elements
- Provide proper ARIA labels
- Ensure keyboard navigation works
- Test with screen readers
- Maintain proper contrast ratios

## Build & Development

### Development Server

```bash
yarn workspace wjl-client dev
```

### Type Checking

```bash
yarn workspace wjl-client typecheck
```

### Building

```bash
yarn workspace wjl-client build
```

## File Organization Best Practices

1. **Group by Feature**: Organize components by feature/domain
2. **Colocate Related Files**: Keep related files close together
3. **Use Index Files**: Create index.ts for barrel exports
4. **Separate Concerns**: Keep business logic, UI, and styles separate
5. **Consistent Structure**: Maintain the same structure across similar components
