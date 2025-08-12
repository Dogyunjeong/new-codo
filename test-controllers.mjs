import { AuthController } from './packages/shared-api-clients/src/Auth.controller.mts';
import { ProfileController } from './packages/shared-api-clients/src/Profile.controller.mts';
import { PostController } from './packages/shared-api-clients/src/Post.controller.mts';

console.log('Testing shared controllers...');

// Test Auth Controller
const authController = new AuthController('http://localhost:4101');
console.log('✅ Auth Controller instantiated');

// Test Profile Controller  
const profileController = new ProfileController('http://localhost:4102');
console.log('✅ Profile Controller instantiated');

// Test Post Controller
const postController = new PostController('http://localhost:4103');
console.log('✅ Post Controller instantiated');

// Test health endpoints via controllers
try {
  const authHealth = await authController.healthCheck();
  console.log('✅ Auth health via controller:', authHealth);
} catch (error) {
  console.log('❌ Auth controller error:', error.message);
}

try {
  const profileHealth = await profileController.healthCheck();
  console.log('✅ Profile health via controller:', profileHealth);
} catch (error) {
  console.log('❌ Profile controller error:', error.message);
}

try {
  const postHealth = await postController.healthCheck();
  console.log('✅ Post health via controller:', postHealth);
} catch (error) {
  console.log('❌ Post controller error:', error.message);
}

console.log('✅ All tests completed!');