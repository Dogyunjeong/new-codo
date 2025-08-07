module.exports = {
  apps: [
    {
      ...require('../ecosystem.config.cjs').apps[0],
      name: 'ziririt-post-service',
    },
  ],
};
