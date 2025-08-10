import { Platform } from 'react-native';

// Development API configuration
const getApiBaseUrl = () => {
  if (__DEV__) {
    // For development, use appropriate host based on platform
    if (Platform.OS === 'ios') {
      // iOS Simulator can use localhost
      return 'http://localhost';
    } else if (Platform.OS === 'android') {
      // Android Emulator needs special IP
      return 'http://10.0.2.2';
    } else {
      // Web or other platforms
      return 'http://localhost';
    }
  }
  
  // Production API endpoints (update these with your production URLs)
  return 'https://api.ziririt.com';
};

const BASE_URL = getApiBaseUrl();

export const API_CONFIG = {
  authServiceUrl: `${BASE_URL}:4101`,
  profileServiceUrl: `${BASE_URL}:4102`,
  postServiceUrl: `${BASE_URL}:4103`,
  feedServiceUrl: `${BASE_URL}:4104`,
  apiGatewayUrl: `${BASE_URL}:8080`,
};

// For physical devices, you may need to use your machine's IP address
// Find your IP address and update this constant if testing on a physical device
export const PHYSICAL_DEVICE_IP = '192.168.1.100'; // Update with your machine's IP

export const getPhysicalDeviceConfig = () => ({
  authServiceUrl: `http://${PHYSICAL_DEVICE_IP}:4101`,
  profileServiceUrl: `http://${PHYSICAL_DEVICE_IP}:4102`,
  postServiceUrl: `http://${PHYSICAL_DEVICE_IP}:4103`,
  feedServiceUrl: `http://${PHYSICAL_DEVICE_IP}:4104`,
  apiGatewayUrl: `http://${PHYSICAL_DEVICE_IP}:8080`,
});