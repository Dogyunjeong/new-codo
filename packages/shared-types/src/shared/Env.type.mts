export interface BaseEnv {
  HOST_URL: string;
  APP_ENV: string; // "local" | "development" | "production";
  API_GATEWAY_URL: string;
  HTTP_PORT: number;
  MONGODB_URL: string;
  MONGODB_DB: string;
  MONGODB_USER: string;
  MONGODB_PASSWORD: string;
  JWT_ID_TOKEN_SIGNING_KEY: string;
  JWT_PRIVATE_KEY: string;
  GCP_TASK_QUEUE_PROJECT_ID: string;
  GCP_TASK_QUEUE_LOCATION: string;
}
