import { getBaseEnvironment } from '@base/server-base';

const baseEnv = getBaseEnvironment();
const baseAppConfig = {
  HOST_URL: baseEnv.HOST_URL || 'localhost',
  API_GATEWAY_URL: baseEnv.API_GATEWAY_URL || 'localhost',
  HTTP_PORT: baseEnv.HTTP_PORT || 4100,
};

export default baseAppConfig;
