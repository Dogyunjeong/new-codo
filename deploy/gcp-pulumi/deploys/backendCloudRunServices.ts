import { CLOUD_TASK_QUEUE } from '../types/CloudTask.type';
import * as gcp from '@pulumi/gcp';

import {
  CONTAINER_DEFAULT_LIMIT,
  buildAndDeployServicesToCloudRun,
  cloudRunConfig,
} from '../pulumiUtil/cloudRunBuildFunction';

const IS_PRODUCTION = process.env.DEPLOY_TARGET === 'production';
const usCentral = gcp.config.region || 'us-central1';

export const BACKEND_BASE_SECRET_NAME = 'base-project-backend-env';

const setUpBackend = () => {
  const backendBaseSecret = new gcp.secretmanager.Secret(
    BACKEND_BASE_SECRET_NAME,
    {
      labels: {
        label: BACKEND_BASE_SECRET_NAME,
      },
      replication: {
        auto: {},
      },
      secretId: BACKEND_BASE_SECRET_NAME,
    },
    {
      protect: true,
    },
  );

  // Create Cloud Tasks queues for each queue defined in CloudTasks.type.mts
  const cloudTaskQueues = Object.values(CLOUD_TASK_QUEUE).map((queueName: string) => {
    return new gcp.cloudtasks.Queue(`cloud-task-queue-${queueName.toLowerCase()}`, {
      name: queueName,
      location: usCentral,
      rateLimits: {
        maxDispatchesPerSecond: 10,
        maxConcurrentDispatches: 100,
      },
      retryConfig: {
        maxAttempts: 5,
        maxRetryDuration: '1800s',
        minBackoff: '10s',
        maxBackoff: '300s',
        maxDoublings: 4,
      },
      // Set appropriate IAM permissions for the queue
      // This will be automatically handled by GCP when the queue is created
    });
  });

  const wjlLearningPathConfig: cloudRunConfig = {
    imageName: 'wjl-learning-path-service',
    args: { BUILD_CONTEXT: 'backend/learning-path-service' },
    dockerfile: '../../backend/Dockerfile.prod',
    context: '../../',
    containerConfig: {
      minInstance: IS_PRODUCTION ? '0' : '0',
      maxInstance: IS_PRODUCTION ? '300' : '5',
      containerConcurrency: 50,
      containerPort: 4100,
      limits: CONTAINER_DEFAULT_LIMIT,
      envs: [
        {
          name: 'LANG_LEARNING_ENV_JSON',
          valueFrom: {
            secretKeyRef: {
              key: 'latest',
              name: BACKEND_BASE_SECRET_NAME,
            },
          },
        },
      ],
    },
    location: usCentral,
  };

  const { service: wjlLearningPathService } = buildAndDeployServicesToCloudRun({
    cloudRunConfig: wjlLearningPathConfig,
  });

  // Open the service to public unrestricted access
  const iamDialogueService = new gcp.cloudrun.IamMember('boilerplate-service', {
    service: wjlLearningPathService.name,
    location: usCentral,
    role: 'roles/run.invoker',
    member: 'allUsers',
  });

  // // Export the URL
  // export const langLearningDialogueServiceUrl = wjlLearningPathService.statuses.apply(
  //   (statuses: any) => statuses[0]?.url,
  // );

  // BULK GENERATOR
  const wjlAdminServiceConfig: cloudRunConfig = {
    imageName: 'wjl-admin-service',
    args: { BUILD_CONTEXT: 'backend/wjl-admin-service/' },
    dockerfile: '../../backend/Dockerfile.prod',
    context: '../../',
    containerConfig: {
      minInstance: IS_PRODUCTION ? '0' : '0',
      maxInstance: IS_PRODUCTION ? '2' : '1',
      containerConcurrency: 50,
      timeoutSeconds: 60 * 20,
      containerPort: 4100,
      limits: CONTAINER_DEFAULT_LIMIT,
      envs: [
        {
          name: 'LANG_LEARNING_ENV_JSON',
          valueFrom: {
            secretKeyRef: {
              key: 'latest',
              name: BACKEND_BASE_SECRET_NAME,
            },
          },
        },
      ],
    },
    location: usCentral,
  };

  const { service: wjlAdminService } = buildAndDeployServicesToCloudRun({
    cloudRunConfig: wjlAdminServiceConfig,
  });

  // Open the service to public unrestricted access
  const wjlAdminServiceIAM = new gcp.cloudrun.IamMember('wjl-admin-service', {
    service: wjlAdminService.name,
    location: usCentral,
    role: 'roles/run.invoker',
    member: 'allUsers',
  });

  // AI Assistant
  const wjlAiAssistantConfig: cloudRunConfig = {
    imageName: 'wjl-ai-assistant-service',
    args: { BUILD_CONTEXT: 'backend/learning-assistant-service/' },
    dockerfile: '../../backend/Dockerfile.prod',
    context: '../../',
    containerConfig: {
      minInstance: IS_PRODUCTION ? '0' : '0',
      maxInstance: IS_PRODUCTION ? '4' : '1',
      containerConcurrency: 50,
      containerPort: 4100,
      timeoutSeconds: 60 * 20,
      limits: CONTAINER_DEFAULT_LIMIT,
      envs: [
        {
          name: 'LANG_LEARNING_ENV_JSON',
          valueFrom: {
            secretKeyRef: {
              key: 'latest',
              name: BACKEND_BASE_SECRET_NAME,
            },
          },
        },
      ],
    },
    location: usCentral,
  };

  const { service: wjlAiAssistantService } = buildAndDeployServicesToCloudRun({
    cloudRunConfig: wjlAiAssistantConfig,
  });

  // Open the service to public unrestricted access
  const aiAssistantIam = new gcp.cloudrun.IamMember('lang-learning-ai-assistant-service', {
    service: wjlAiAssistantService.name,
    location: usCentral,
    role: 'roles/run.invoker',
    member: 'allUsers',
  });

  const cloudRunServices = {
    wjlLearningPathService,
    wjlAdminService,
    wjlAiAssistantService,
    backendBaseSecret,
  };
  return cloudRunServices;
};

export default setUpBackend;
