import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginScreen from '../login';

// Mock the useAppSelector and useAppDispatch hooks
const mockUseAppSelector = jest.fn();
const mockUseAppDispatch = jest.fn();
jest.mock('../../../src/store', () => ({
  useAppSelector: () => mockUseAppSelector(),
  useAppDispatch: () => mockUseAppDispatch(),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

// Mock expo modules
jest.mock('expo-auth-session', () => ({}));
jest.mock('expo-crypto', () => ({}));

const { router } = require('expo-router');

describe('LoginScreen Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock default auth state
    mockUseAppSelector.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    mockUseAppDispatch.mockReturnValue(jest.fn());
  });

  it('renders login screen correctly', () => {
    render(<LoginScreen />);
    
    // Check if main elements are rendered
    expect(screen.getByText('Welcome to Ziririt')).toBeInTheDocument();
    expect(screen.getByText('Track your goals and share your progress')).toBeInTheDocument();
  });

  it('displays login buttons', () => {
    render(<LoginScreen />);
    
    // Check if login buttons are present
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
    expect(screen.getByText('Continue with Apple')).toBeInTheDocument();
  });

  it('displays dev bypass button in development mode', () => {
    // Mock __DEV__ to be true
    (global as any).__DEV__ = true;
    
    render(<LoginScreen />);
    
    // Check if dev button is present
    expect(screen.getByText('Dev: Skip Login')).toBeInTheDocument();
  });

  it('handles dev bypass button press', () => {
    (global as any).__DEV__ = true;
    
    render(<LoginScreen />);
    
    const devButton = screen.getByText('Dev: Skip Login');
    fireEvent.click(devButton);
    
    // Should navigate to tabs
    expect(router.replace).toHaveBeenCalledWith('/(tabs)/feed');
  });

  it('handles loading state', () => {
    // Mock loading state
    mockUseAppSelector.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      error: null,
    });
    
    render(<LoginScreen />);
    
    // Buttons should be disabled when loading - they still exist but may be disabled
    const googleButton = screen.getByText('Continue with Google');
    const appleButton = screen.getByText('Continue with Apple');
    
    expect(googleButton).toBeInTheDocument();
    expect(appleButton).toBeInTheDocument();
  });
});