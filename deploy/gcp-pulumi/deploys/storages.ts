import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';
import PULUMI_CONFIG from '../configs/pulumit.config';

const PUBLIC_BUCKET_NAME = PULUMI_CONFIG.IS_PROD_DEPLOY ? 'wjl-prod-public' : 'wjl-dev-public';
const CORS_WHITELIST = PULUMI_CONFIG.IS_PROD_DEPLOY
  ? ['https://woojoolearn.app', 'http://woojoolearn.app']
  : ['http://localhost:3000', 'http://localhost:4300'];

const setUpStorage = () => {
  const wjlPublicStorageUSCentral = new gcp.storage.Bucket(
    PUBLIC_BUCKET_NAME,
    {
      name: PUBLIC_BUCKET_NAME,
      location: 'US',
      forceDestroy: true,
      uniformBucketLevelAccess: true,

      cors: [
        {
          origins: CORS_WHITELIST,
          methods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE'],
          responseHeaders: ['*'],
          maxAgeSeconds: 3600,
        },
      ],
    },
    {
      protect: true,
    },
  );

  const storages = {
    wjlPublicStorageUSCentral,
  };

  new gcp.storage.BucketIAMBinding('public-read-access', {
    bucket: wjlPublicStorageUSCentral.name,
    role: 'roles/storage.objectViewer',
    members: ['allUsers'],
  });

  return storages;
};

export default setUpStorage;
