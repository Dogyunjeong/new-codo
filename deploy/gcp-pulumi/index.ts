import PULUMI_CONFIG from './configs/pulumit.config';
import setUpProject from './deploys/setUpProject';
import setUpStorage from './deploys/storages';

const init = () => {
  setUpStorage();
  if (PULUMI_CONFIG.IS_PROD_DEPLOY) {
    setUpProject();
  }
};

init();
