// Re-export shared types
export * from '@base/shared-types';

// App-specific types
export interface AppState {
  isLoading: boolean;
  error: string | null;
}

export interface NavigationState {
  isAuthenticated: boolean;
  user: any | null;
}