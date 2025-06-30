import setUpFrontend from './frontCloudRunServices';
import { createExternalLoadBalance, LoadBalanceConfig } from './externalLoadbalancer';
import './storages';
import * as LanguageTypes from '../types/Language.type';

const setUpProject = () => {
  const services = setUpFrontend();
  const usCentral1BackendCloudRuns = services.backendServices;
  const usCentralFrontendResources = services.frontendResources;

  const SUPPORT_LOCALES = Object.values(LanguageTypes.SUPPORT_LOCALE);

  const config: LoadBalanceConfig = {
    hostDomains: ['woojoolearn.app'],
    backendServiceConfigs: [
      {
        backends: {
          isDefault: true,
          pathMatcher: {
            paths: [
              '/',
              '/favicon.ico',
              '/icon.ico',
              '/profiles/*',
              '/locales/*',
              ...SUPPORT_LOCALES.map((locale) => `/${locale}/*`),
            ],
          },
        },
        cloudRunConfigs: [
          {
            name: 'wjl-client-service',
            service: usCentralFrontendResources.wjlClientService,
            region: 'us-central1',
          },
        ],
      },
      {
        backends: {
          pathMatcher: {
            paths: [
              '/api/learning-paths/*',
              '/api/learning-nodes/*',
              '/api/word-dictionaries/*',
              '/api/simple-sentences/*',
              '/cached-api/learning-paths/*',
              '/cached-api/learning-nodes/*',
              '/cached-api/word-dictionaries/*',
              '/cached-api/simple-sentences/*',
            ],
          },
        },
        cloudRunConfigs: [
          {
            name: 'wjl-learning-path-service',
            service: usCentral1BackendCloudRuns.wjlLearningPathService,
            region: 'us-central1',
          },
        ],
      },
      {
        backends: {
          pathMatcher: {
            paths: ['/api/ai-assistant/*'],
          },
        },
        cloudRunConfigs: [
          {
            name: 'wjl-ai-assistant-service',
            service: usCentral1BackendCloudRuns.wjlAiAssistantService,
            region: 'us-central1',
          },
        ],
      },
      {
        backends: {
          pathMatcher: {
            paths: ['/admin-api/*'],
          },
        },
        cloudRunConfigs: [
          {
            name: 'wjl-admin-service',
            service: usCentral1BackendCloudRuns.wjlAdminService,
            region: 'us-central1',
          },
        ],
      },
    ],
  };

  createExternalLoadBalance(config);
};

export default setUpProject;
