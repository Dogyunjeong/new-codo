export const theme = {
  colors: {
    // Primary colors
    primary: '#111827', // Near black for primary actions
    primaryText: '#1F2937', // Dark gray for main text
    secondaryText: '#6B7280', // Medium gray for secondary text
    tertiaryText: '#9CA3AF', // Light gray for tertiary text
    
    // Backgrounds
    background: '#FFFFFF', // Pure white
    surface: '#F9FAFB', // Light gray surface
    surfaceLight: '#F3F4F6', // Lighter gray for inactive elements
    
    // Borders
    border: '#E5E7EB', // Light gray border
    divider: '#E5E7EB', // Same as border
    
    // Semantic colors
    success: '#10B981', // Green
    danger: '#EF4444', // Red
    warning: '#F59E0B', // Orange
    info: '#3B82F6', // Blue
    
    // Special
    black: '#000000',
    white: '#FFFFFF',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  borderRadius: {
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    xxl: 16,
    full: 999,
  },
  
  typography: {
    // App name/Logo
    logo: {
      fontSize: 20,
      fontWeight: '700' as const,
      lineHeight: 24,
    },
    // Screen headers
    screenHeader: {
      fontSize: 17,
      fontWeight: '600' as const,
      lineHeight: 22,
    },
    // Section titles
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 20,
    },
    // User names
    userName: {
      fontSize: 15,
      fontWeight: '600' as const,
      lineHeight: 20,
    },
    // Body text
    body: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    // Button text
    button: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 20,
    },
    // Small text
    small: {
      fontSize: 13,
      fontWeight: '400' as const,
      lineHeight: 18,
    },
    // Caption/meta text
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
    // Tiny labels
    label: {
      fontSize: 11,
      fontWeight: '500' as const,
      lineHeight: 14,
    },
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 8,
    },
  },
}