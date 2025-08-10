import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import IndexStep3 from '../index.step3';

// Import the mocked router
const { router } = require('expo-router');

describe('Index Step3 Component - Navigation Functionality', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders correctly with TouchableOpacity buttons', () => {
    render(<IndexStep3 />);
    
    // Check if main content is rendered
    expect(screen.getByText('🚀 Ziririt App Test')).toBeInTheDocument();
    expect(screen.getByText('App is working!')).toBeInTheDocument();
    expect(screen.getByText('Auth Status:')).toBeInTheDocument();
  });

  it('renders interactive buttons', () => {
    render(<IndexStep3 />);
    
    // Check if both navigation buttons are present
    const loginButton = screen.getByText('Go to Login');
    const tabsButton = screen.getByText('Go to Tabs (Test)');
    
    expect(loginButton).toBeInTheDocument();
    expect(tabsButton).toBeInTheDocument();
    
    // Check that they are in buttons (TouchableOpacity renders as button)
    expect(loginButton.closest('button')).toBeTruthy();
    expect(tabsButton.closest('button')).toBeTruthy();
  });

  it('navigates to login when login button is pressed', () => {
    render(<IndexStep3 />);
    
    const loginButton = screen.getByText('Go to Login');
    fireEvent.click(loginButton);
    
    expect(router.push).toHaveBeenCalledWith('/auth/login');
  });

  it('navigates to tabs when tabs button is pressed', () => {
    render(<IndexStep3 />);
    
    const tabsButton = screen.getByText('Go to Tabs (Test)');
    fireEvent.click(tabsButton);
    
    expect(router.push).toHaveBeenCalledWith('/(tabs)/feed');
  });

  it('calls navigation functions only when buttons are clicked', () => {
    render(<IndexStep3 />);
    
    // Router should not be called initially
    expect(router.push).not.toHaveBeenCalled();
    
    // Click both buttons
    fireEvent.click(screen.getByText('Go to Login'));
    fireEvent.click(screen.getByText('Go to Tabs (Test)'));
    
    // Should be called exactly twice
    expect(router.push).toHaveBeenCalledTimes(2);
  });
});