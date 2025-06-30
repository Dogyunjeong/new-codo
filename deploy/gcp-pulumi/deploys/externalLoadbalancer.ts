import * as gcp from '@pulumi/gcp';

export interface CloudRunConfig {
  name: string;
  service: gcp.cloudrun.Service;
  region: string;
}

export interface BackendServiceConfig {
  enableCdn?: boolean;
  connectionDrainingTimeoutSec?: number;
  backends: {
    isDefault?: boolean;
    pathMatcher: {
      paths: string[];
    };
  };
  cloudRunConfigs: CloudRunConfig[];
}

export interface LoadBalanceConfig {
  hostDomains: string[];
  backendServiceConfigs: BackendServiceConfig[];
}

const createBackendServiceForCloudRun = (cloudRunConfigs: CloudRunConfig[]) => {
  const endpointGroups = cloudRunConfigs.map((config) => {
    return new gcp.compute.RegionNetworkEndpointGroup(
      `${config.name}-${config.region}-endpoint-group`,
      {
        networkEndpointType: 'SERVERLESS',
        region: config.region,
        cloudRun: {
          service: config.service.name,
        },
      },
    );
  });

  const serviceName = `${cloudRunConfigs[0].name}-backend-service`;
  const service = new gcp.compute.BackendService(serviceName, {
    enableCdn: false,
    connectionDrainingTimeoutSec: 10,
    backends: endpointGroups.map((endpoint_group) => {
      return {
        group: endpoint_group.id,
      };
    }),
  });

  return {
    name: serviceName,
    service,
    endpointGroups,
  };
};

export const createExternalLoadBalance = (config: LoadBalanceConfig) => {
  const ipaddress = new gcp.compute.GlobalAddress('wjl-prod-external-lb-ip', {
    addressType: 'EXTERNAL',
  });

  const backendServices = config.backendServiceConfigs.map((backendServiceConfig) => {
    return createBackendServiceForCloudRun(backendServiceConfig.cloudRunConfigs);
  });

  const pathMatcherName = `all-paths-for-wjl`;
  const pathRules = backendServices.reduce(
    (acc: any, backendService, index) => {
      const pathRules = {
        paths: config.backendServiceConfigs[index].backends.pathMatcher.paths,
        service: backendService.service.id,
      };
      return [...acc, pathRules];
    },
    [] as {
      paths: string[];
      service: string;
    }[],
  );

  const defaultService = backendServices.find((backendService, index) => {
    return config.backendServiceConfigs[index].backends.isDefault;
  });

  const https_paths = new gcp.compute.URLMap('wjl-prod-external-lb-https', {
    defaultService: defaultService?.service.id || backendServices[0].service.id,
    hostRules: [
      {
        hosts: ['woojoolearn.app'],
        pathMatcher: pathMatcherName,
      },
    ],
    pathMatchers: [
      {
        name: pathMatcherName,
        defaultService: backendServices[0].service.id,
        pathRules: pathRules,
      },
    ],
  });

  const certificate = new gcp.compute.ManagedSslCertificate('wjl-certificate-06-21', {
    managed: {
      domains: ['woojoolearn.app'],
    },
  });

  const https_proxy = new gcp.compute.TargetHttpsProxy('wjl-lb-https-proxy', {
    urlMap: https_paths.selfLink,
    sslCertificates: [certificate.id],
  });

  new gcp.compute.GlobalForwardingRule('wjl-lb-https', {
    target: https_proxy.selfLink,
    ipAddress: ipaddress.address,
    portRange: '443',
    loadBalancingScheme: 'EXTERNAL',
  });

  /**
   * HTTP to HTTPS redirect
   */

  const http_paths = new gcp.compute.URLMap('wjl-service-http', {
    defaultService: backendServices[0].service.id,
    hostRules: [
      {
        hosts: ['woojoolearn.app'],
        pathMatcher: 'all-paths',
      },
    ],
    pathMatchers: [
      {
        name: 'all-paths',
        defaultService: backendServices[0].service.id,
        pathRules: [
          {
            paths: ['/*'],
            urlRedirect: {
              stripQuery: false,
              httpsRedirect: true,
            },
          },
        ],
      },
    ],
  });

  const http_proxy = new gcp.compute.TargetHttpProxy('wjl-lb-http-proxy', {
    urlMap: http_paths.selfLink,
  });

  new gcp.compute.GlobalForwardingRule('wjl-lb-http', {
    target: http_proxy.selfLink,
    ipAddress: ipaddress.address,
    portRange: '80',
    loadBalancingScheme: 'EXTERNAL',
  });
};
