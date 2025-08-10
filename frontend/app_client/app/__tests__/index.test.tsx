import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Index from '../index';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

const { router } = require('expo-router');

describe('Index Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with test content', () => {
    render(<Index />);
    
    // Check if main title is rendered
    expect(screen.getByText('🚀 Ziririt App Test')).toBeInTheDocument();
    expect(screen.getByText('App is working!')).toBeInTheDocument();
  });

  it('displays auth status information', () => {
    render(<Index />);
    
    // Check auth status display
    expect(screen.getByText('Auth Status:')).toBeInTheDocument();
    expect(screen.getByText('Loading: false (temporarily disabled)')).toBeInTheDocument();
    expect(screen.getByText('Authenticated: false (temporarily disabled)')).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    render(<Index />);
    
    // Check if both navigation buttons are present
    expect(screen.getByText('Go to Login')).toBeInTheDocument();
    expect(screen.getByText('Go to Tabs (Test)')).toBeInTheDocument();
  });

  it('navigates to login when login button is pressed', () => {
    render(<Index />);
    
    const loginButton = screen.getByText('Go to Login');
    fireEvent.click(loginButton);
    
    expect(router.push).toHaveBeenCalledWith('/auth/login');
  });

  it('navigates to tabs when tabs button is pressed', () => {
    render(<Index />);
    
    const tabsButton = screen.getByText('Go to Tabs (Test)');
    fireEvent.click(tabsButton);
    
    expect(router.push).toHaveBeenCalledWith('/(tabs)/feed');
  });

  it('has proper styling classes', () => {
    render(<Index />);
    
    // Check if main container exists (testing component structure)
    const title = screen.getByText('🚀 Ziririt App Test');
    expect(title).toBeInTheDocument();
    
    // Check buttons are touchable
    const loginButton = screen.getByText('Go to Login');
    const tabsButton = screen.getByText('Go to Tabs (Test)');
    
    expect(loginButton).toBeInTheDocument();
    expect(tabsButton).toBeInTheDocument();
  });
});