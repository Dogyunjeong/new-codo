const baseEnvConfig = {
  GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  IS_LOCAL: (process.env.NODE_ENV as any) === "local",
  SENTRY_DSN: process.env.SENTRY_DSN,
  SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT,
};

export default baseEnvConfig;
