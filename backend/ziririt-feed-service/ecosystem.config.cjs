module.exports = {
  apps: [{
    name: 'ziririt-feed-service',
    script: 'src/index.mts',
    interpreter: 'tsx',
    instances: 1,
    autorestart: true,
    watch: true,
    ignore_watch: ['node_modules', 'dist'],
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 4104,
    },
  }],
};