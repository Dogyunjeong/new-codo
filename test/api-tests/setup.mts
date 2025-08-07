import { beforeAll, afterAll } from 'vitest';

// Test environment configuration
const TEST_CONFIG = {
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://localhost:4101',
  PROFILE_SERVICE_URL: process.env.PROFILE_SERVICE_URL || 'http://localhost:4102',
  POST_SERVICE_URL: process.env.POST_SERVICE_URL || 'http://localhost:4103',
  TEST_TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// Global test setup
beforeAll(async () => {
  console.log('🚀 Starting API Test Suite');
  console.log('Services Configuration:');
  console.log(`  - Auth Service: ${TEST_CONFIG.AUTH_SERVICE_URL}`);
  console.log(`  - Profile Service: ${TEST_CONFIG.PROFILE_SERVICE_URL}`);  
  console.log(`  - Post Service: ${TEST_CONFIG.POST_SERVICE_URL}`);
  
  // Wait for services to be ready (optional)
  await new Promise(resolve => setTimeout(resolve, 2000));
});

afterAll(async () => {
  console.log('🏁 API Test Suite Complete');
});

// Export test configuration for use in tests
export { TEST_CONFIG };