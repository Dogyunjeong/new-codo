// Environment configuration for the mobile app
const ENV = {
  development: {
    AUTH_SERVICE_URL: 'http://localhost:4101',
    PROFILE_SERVICE_URL: 'http://localhost:4102',
    POST_SERVICE_URL: 'http://localhost:4103',
    FEED_SERVICE_URL: 'http://localhost:4104',
  },
  staging: {
    AUTH_SERVICE_URL: 'https://staging-auth.ziririt.com',
    PROFILE_SERVICE_URL: 'https://staging-profile.ziririt.com',
    POST_SERVICE_URL: 'https://staging-post.ziririt.com',
    FEED_SERVICE_URL: 'https://staging-feed.ziririt.com',
  },
  production: {
    AUTH_SERVICE_URL: 'https://auth.ziririt.com',
    PROFILE_SERVICE_URL: 'https://profile.ziririt.com',
    POST_SERVICE_URL: 'https://post.ziririt.com',
    FEED_SERVICE_URL: 'https://feed.ziririt.com',
  },
}

const getEnvironment = () => {
  // You can use expo-constants or react-native-config for environment detection
  // For now, we'll default to development
  if (__DEV__) {
    return 'development'
  }
  // You can check for staging/production based on your build configuration
  return 'production'
}

const currentEnv = getEnvironment()

export default ENV[currentEnv as keyof typeof ENV]