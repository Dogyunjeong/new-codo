// Test if HttpRequest has the new methods
import HttpRequest from './packages/shared-utils/src/requests/HttpRequest.mts';

const instance = new HttpRequest({ baseURL: 'http://test' });

console.log('HttpRequest methods:');
console.log('- setAccessToken:', typeof instance.setAccessToken);
console.log('- setTokenRefreshHandler:', typeof instance.setTokenRefreshHandler);
console.log('- setAuthErrorHandler:', typeof instance.setAuthErrorHandler);

if (instance.setTokenRefreshHandler && instance.setAuthErrorHandler) {
  console.log('✅ All methods exist!');
} else {
  console.log('❌ Methods missing!');
}
