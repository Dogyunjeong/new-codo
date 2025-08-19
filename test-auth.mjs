// Test authentication endpoints
const AUTH_URL = 'http://localhost:4101';

async function testSignup() {
  console.log('Testing signup...');
  try {
    const response = await fetch(`${AUTH_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }),
    });
    
    const data = await response.json();
    console.log('Signup response:', response.status, data);
    return data;
  } catch (error) {
    console.error('Signup error:', error);
  }
}

async function testLogin() {
  console.log('\nTesting login...');
  try {
    const response = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });
    
    const data = await response.json();
    console.log('Login response:', response.status, data);
    return data;
  } catch (error) {
    console.error('Login error:', error);
  }
}

async function testAuthFlow() {
  // Test signup
  await testSignup();
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test login
  await testLogin();
}

testAuthFlow();