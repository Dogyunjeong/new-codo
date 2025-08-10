import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import IndexSimple from '../index.simple';

describe('Index Simple Component - Step 1', () => {
  it('renders correctly with test content', () => {
    render(<IndexSimple />);
    
    // Check if main title is rendered
    expect(screen.getByText('🚀 Ziririt App Test')).toBeInTheDocument();
    expect(screen.getByText('App is working!')).toBeInTheDocument();
  });

  it('displays auth status information', () => {
    render(<IndexSimple />);
    
    // Check auth status display
    expect(screen.getByText('Auth Status:')).toBeInTheDocument();
    expect(screen.getByText('Loading: false (temporarily disabled)')).toBeInTheDocument();
    expect(screen.getByText('Authenticated: false (temporarily disabled)')).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    render(<IndexSimple />);
    
    // Check if both navigation buttons are present
    expect(screen.getByText('Go to Login')).toBeInTheDocument();
    expect(screen.getByText('Go to Tabs (Test)')).toBeInTheDocument();
  });
});