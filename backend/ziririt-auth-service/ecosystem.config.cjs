module.exports = {
  apps: [
    {
      name: 'ziririt-auth-service',
      script: './dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 4101,
        SERVICE_NAME: 'ziririt-auth-service'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4101,
        SERVICE_NAME: 'ziririt-auth-service'
      },
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
      log_file: 'logs/combined.log',
      time: true,
    },
  ],
};