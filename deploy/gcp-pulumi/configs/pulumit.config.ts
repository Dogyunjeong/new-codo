const PULUMI_CONFIG = {
  IS_DEV_DEPLOY: process.env.DEPLOY_TARGET === 'development',
  IS_PROD_DEPLOY: process.env.DEPLOY_TARGET === 'production',
};

export default PULUMI_CONFIG;
