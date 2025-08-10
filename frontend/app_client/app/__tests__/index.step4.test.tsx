import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import IndexStep4 from '../index.step4';

// Mock the useAppSelector hook
const mockUseAppSelector = jest.fn();
jest.mock('../../src/store', () => ({
  useAppSelector: () => mockUseAppSelector(),
}));

// Import the mocked router
const { router } = require('expo-router');

describe('Index Step4 Component - Redux Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default auth state', () => {
    // Mock auth state
    mockUseAppSelector.mockReturnValue({ isAuthenticated: false, isLoading: false });
    
    render(<IndexStep4 />);
    
    // Check if main content is rendered
    expect(screen.getByText('🚀 Ziririt App Test')).toBeInTheDocument();
    expect(screen.getByText('App is working!')).toBeInTheDocument();
    
    // Check default auth state
    expect(screen.getByText('Loading: false')).toBeInTheDocument();
    expect(screen.getByText('Authenticated: false')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    // Mock loading state
    mockUseAppSelector.mockReturnValue({ isAuthenticated: false, isLoading: true });
    
    render(<IndexStep4 />);
    
    // Should show loading screen instead of main content - check by the absence of main content
    expect(screen.queryByText('🚀 Ziririt App Test')).not.toBeInTheDocument();
    expect(screen.queryByText('Go to Login')).not.toBeInTheDocument();
    // ActivityIndicator should be present (renders as div with "Loading...")
    expect(screen.getAllByText('Loading...').length).toBeGreaterThanOrEqual(1);
  });

  it('shows authenticated state correctly', () => {
    // Mock authenticated state
    mockUseAppSelector.mockReturnValue({ isAuthenticated: true, isLoading: false });
    
    render(<IndexStep4 />);
    
    // Should show authenticated state
    expect(screen.getByText('Authenticated: true')).toBeInTheDocument();
    expect(screen.getByText('Loading: false')).toBeInTheDocument();
  });

  it('navigation works with Redux state', () => {
    // Mock default state
    mockUseAppSelector.mockReturnValue({ isAuthenticated: false, isLoading: false });
    
    render(<IndexStep4 />);
    
    // Test navigation
    fireEvent.click(screen.getByText('Go to Login'));
    expect(router.push).toHaveBeenCalledWith('/auth/login');
    
    fireEvent.click(screen.getByText('Go to Tabs (Test)'));
    expect(router.push).toHaveBeenCalledWith('/(tabs)/feed');
  });

  it('renders buttons even when not authenticated', () => {
    // Mock unauthenticated state
    mockUseAppSelector.mockReturnValue({ isAuthenticated: false, isLoading: false });
    
    render(<IndexStep4 />);
    
    // Buttons should be present
    expect(screen.getByText('Go to Login')).toBeInTheDocument();
    expect(screen.getByText('Go to Tabs (Test)')).toBeInTheDocument();
  });
});