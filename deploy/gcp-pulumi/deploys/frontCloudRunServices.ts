import * as gcp from '@pulumi/gcp';

import {
  CONTAINER_DEFAULT_LIMIT,
  buildAndDeployServicesToCloudRun,
  cloudRunConfig,
} from '../pulumiUtil/cloudRunBuildFunction';
import setUpBackend from './backendCloudRunServices';

const IS_PRODUCTION = process.env.DEPLOY_TARGET === 'production';

const usCentral = gcp.config.region || 'us-central1';

const SSR_SECRET_NAME = 'lang-learning-web-client-ssr-env';

const setUpFrontend = () => {
  const backendServices = setUpBackend();
  const ssrSecret = new gcp.secretmanager.Secret(
    SSR_SECRET_NAME,
    {
      labels: {
        label: SSR_SECRET_NAME,
      },
      replication: {
        auto: {},
      },
      secretId: SSR_SECRET_NAME,
    },
    {
      protect: true,
    },
  );

  const NEXT_PUBLIC_ENV_NAME = 'lang-learning-web-client-next-public-env';

  const publicSecret = new gcp.secretmanager.Secret(
    NEXT_PUBLIC_ENV_NAME,
    {
      labels: {
        label: NEXT_PUBLIC_ENV_NAME,
      },
      replication: {
        auto: {},
      },
      secretId: NEXT_PUBLIC_ENV_NAME,
    },
    {
      protect: true,
    },
  );

  // const langLearningWebClient: cloudRunConfig = {
  //   imageName: 'lang-learning-client',
  //   args: {
  //     BUILD_CONTEXT: 'frontend/lang-learning-client',
  //     SSR_LANG_LEARNING_ENV_JSON: process.env.SSR_LANG_LEARNING_ENV_JSON as string,
  //     NEXT_PUBLIC_LANG_LEARNING_ENV_JSON: process.env.NEXT_PUBLIC_LANG_LEARNING_ENV_JSON as string,
  //   },
  //   dockerfile: '../../frontend/Dockerfile.prod',
  //   context: '../../',
  //   containerConfig: {
  //     minInstance: IS_PRODUCTION ? '0' : '0',
  //     maxInstance: IS_PRODUCTION ? '300' : '5',
  //     containerConcurrency: 50,
  //     containerPort: 3000,
  //     limits: {
  //       memory: '4Gi',
  //       cpu: '2',
  //     },
  //     envs: [
  //       {
  //         name: 'SSR_LANG_LEARNING_ENV_JSON',
  //         valueFrom: {
  //           secretKeyRef: {
  //             key: 'latest',
  //             name: SSR_SECRET_NAME,
  //           },
  //         },
  //       },
  //       {
  //         name: 'NEXT_PUBLIC_LANG_LEARNING_ENV_JSON',
  //         valueFrom: {
  //           secretKeyRef: {
  //             key: 'latest',
  //             name: NEXT_PUBLIC_ENV_NAME,
  //           },
  //         },
  //       },
  //     ],
  //   },
  //   location: usCentral,
  //   dependOn: [ssrSecret, publicSecret, backendServices.wjlLearningPathService],
  // };

  // const { service: langLearningWebClientService } = buildAndDeployServicesToCloudRun({
  //   cloudRunConfig: langLearningWebClient,
  // });

  // // Open the service to public unrestricted access
  // const iamLangLearning = new gcp.cloudrun.IamMember('lang-learning-public', {
  //   service: langLearningWebClientService.name,
  //   location: usCentral,
  //   role: 'roles/run.invoker',
  //   member: 'allUsers',
  // });

  // Remix
  const wjlClientConfig: cloudRunConfig = {
    imageName: 'wjl-client',
    args: {
      BUILD_CONTEXT: 'frontend/wjl-client',
      BUILD_TARGET: 'wjl-client',
      SSR_LANG_LEARNING_ENV_JSON: process.env.SSR_LANG_LEARNING_ENV_JSON as string,
      NEXT_PUBLIC_LANG_LEARNING_ENV_JSON: process.env.NEXT_PUBLIC_LANG_LEARNING_ENV_JSON as string,
    },
    dockerfile: '../../frontend/Dockerfile.prod.ReactRouter',
    context: '../../',
    containerConfig: {
      minInstance: IS_PRODUCTION ? '0' : '0',
      maxInstance: IS_PRODUCTION ? '300' : '5',
      containerConcurrency: 50,
      containerPort: 3000,
      limits: {
        memory: '2Gi',
        cpu: '1',
      },
      envs: [
        {
          name: 'SSR_LANG_LEARNING_ENV_JSON',
          valueFrom: {
            secretKeyRef: {
              key: 'latest',
              name: SSR_SECRET_NAME,
            },
          },
        },
        {
          name: 'NEXT_PUBLIC_LANG_LEARNING_ENV_JSON',
          valueFrom: {
            secretKeyRef: {
              key: 'latest',
              name: NEXT_PUBLIC_ENV_NAME,
            },
          },
        },
      ],
    },
    location: usCentral,
    dependOn: [ssrSecret, publicSecret, backendServices.wjlLearningPathService],
  };

  const { service: wjlClientService } = buildAndDeployServicesToCloudRun({
    cloudRunConfig: wjlClientConfig,
  });

  // Open the service to public unrestricted access
  const iamWjlClient = new gcp.cloudrun.IamMember('wjl-client-public', {
    service: wjlClientService.name,
    location: usCentral,
    role: 'roles/run.invoker',
    member: 'allUsers',
  });

  // // Export the URL
  // export const langLearningWebClientUrl = langLearningWebClientService.statuses.apply(
  //   (statuses) => statuses[0]?.url,
  // );

  const frontendResources = {
    ssrSecret,
    publicSecret,
    wjlClientService,
  };
  return { frontendResources, backendServices };
};

export default setUpFrontend;
