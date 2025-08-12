import { EnvTypes } from '@base/shared-types';
import 'dotenv/config';

const getBaseEnvironment = (): EnvTypes.BaseEnv => {
  const { NODE_ENV, BASE_ENV_JSON } = process.env;
  if (!BASE_ENV_JSON) {
    throw new Error('BASE_ENV_JSON is not defined');
  }
  const baseEnv: EnvTypes.BaseEnv = JSON.parse(BASE_ENV_JSON || '{}');
  return baseEnv;
};

export { getBaseEnvironment };
