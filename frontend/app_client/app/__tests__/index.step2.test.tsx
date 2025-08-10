import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import IndexStep2 from '../index.step2';

describe('Index Step2 Component - React Native Components', () => {
  it('renders correctly with React Native View and Text', () => {
    render(<IndexStep2 />);
    
    // Check if main title is rendered
    expect(screen.getByText('🚀 Ziririt App Test')).toBeInTheDocument();
    expect(screen.getByText('App is working!')).toBeInTheDocument();
  });

  it('displays auth status information in React Native components', () => {
    render(<IndexStep2 />);
    
    // Check auth status display
    expect(screen.getByText('Auth Status:')).toBeInTheDocument();
    expect(screen.getByText('Loading: false (temporarily disabled)')).toBeInTheDocument();
    expect(screen.getByText('Authenticated: false (temporarily disabled)')).toBeInTheDocument();
  });

  it('renders buttons as Text components (before adding TouchableOpacity)', () => {
    render(<IndexStep2 />);
    
    // Check if both navigation texts are present
    expect(screen.getByText('Go to Login')).toBeInTheDocument();
    expect(screen.getByText('Go to Tabs (Test)')).toBeInTheDocument();
  });
});