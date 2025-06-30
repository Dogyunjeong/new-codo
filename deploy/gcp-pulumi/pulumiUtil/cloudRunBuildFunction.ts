import * as docker from '@pulumi/docker';
import * as gcp from '@pulumi/gcp';
import { cloudrun } from '@pulumi/gcp/types/output';
import * as pulumi from '@pulumi/pulumi';

export const CONTAINER_DEFAULT_LIMIT = {
  memory: '1Gi',
  cpu: '1',
};

export interface cloudRunConfig {
  imageName: string;
  args?: {
    [key: string]: string;
  };
  containerConfig: {
    containerConcurrency?: number;
    containerPort: number;
    timeoutSeconds?: number;
    limits: {
      memory: string;
      cpu: string;
    };
    envs?: cloudrun.ServiceTemplateSpecContainerEnv[];
    minInstance?: string;
    maxInstance?: string;
  };
  location: string;
  context: string;
  dockerfile: string;
  dependOn?: pulumi.Resource[];
}
export const buildAndDeployServicesToCloudRun = ({
  cloudRunConfig,
}: {
  cloudRunConfig: cloudRunConfig;
}) => {
  const {
    imageName: serviceName,
    containerConfig,
    args,
    dockerfile,
    context,
    location,
    dependOn,
  } = cloudRunConfig;

  const repo = new gcp.artifactregistry.Repository(serviceName, {
    location: location,
    repositoryId: serviceName,
    description: `docker repository for ${serviceName}`,
    format: 'DOCKER',
  });

  const dockerImagePath = pulumi.interpolate`${location}-docker.pkg.dev/${gcp.config.project}/${serviceName}/${serviceName}`;

  const myImage = new docker.Image(serviceName, {
    imageName: dockerImagePath,
    build: {
      context,
      dockerfile: dockerfile,
      args: {
        ...args,
      },
      platform: 'linux/amd64',
    },
  });
  const service = new gcp.cloudrun.Service(
    serviceName,
    {
      name: serviceName,
      location,
      autogenerateRevisionName: true,
      template: {
        metadata: {
          annotations: {
            ['autoscaling.knative.dev/minScale']: containerConfig.minInstance ?? '0',
            ['autoscaling.knative.dev/maxScale']: containerConfig.maxInstance ?? '100',
          },
        },
        spec: {
          containerConcurrency: containerConfig?.containerConcurrency || 200,
          timeoutSeconds: containerConfig?.timeoutSeconds || 600,
          containers: [
            {
              image: myImage.repoDigest,
              resources: {
                limits: containerConfig.limits,
              },
              envs: containerConfig.envs,
              ports: [
                {
                  containerPort: containerConfig.containerPort,
                },
              ],
            },
          ],
        },
      },
    },
    {
      dependsOn: dependOn ? [repo, myImage, ...dependOn] : [repo, myImage],
    },
  );
  return {
    serviceName,
    service,
  };
};

export const buildAndDeployApiGatewayToCloudRun = ({
  cloudRunConfig,
}: {
  cloudRunConfig: cloudRunConfig;
}) => {
  const { imageName, containerConfig, args, location } = cloudRunConfig;
  const dockerImagePath = pulumi.interpolate`gcr.io/${gcp.config.project}/${imageName}:latest`;

  const myImage = new docker.Image(imageName, {
    imageName: dockerImagePath,
    build: {
      context: '../../',
      dockerfile: '../../Dockerfile.prod',
      args: {
        ...args,
      },
      platform: 'linux/amd64',
    },
  });

  const service = new gcp.cloudrun.Service(imageName, {
    location,
    template: {
      spec: {
        containers: [
          {
            image: myImage.repoDigest,
            resources: {
              limits: containerConfig.limits,
            },
            ports: [
              {
                containerPort: containerConfig.containerPort,
              },
            ],
          },
        ],
        containerConcurrency: containerConfig?.containerConcurrency || 500,
      },
    },
  });
  return {
    imageName,
    service,
  };
};
