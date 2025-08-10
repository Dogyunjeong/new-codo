import React from 'react';

// Step 1: Simplest possible component - pure React, no React Native
export default function Index() {
  return (
    <div>
      <h1>🚀 Ziririt App Test</h1>
      <p>App is working!</p>
      <div>
        <h2>Auth Status:</h2>
        <p>Loading: false (temporarily disabled)</p>
        <p>Authenticated: false (temporarily disabled)</p>
      </div>
      <div>
        <button>Go to Login</button>
        <button>Go to Tabs (Test)</button>
      </div>
    </div>
  );
}