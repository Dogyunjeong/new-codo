import { HttpClientService, LoggerService } from '@base/shared-services';

// Abstract interface that can be implemented by HTTP, gRPC, or other protocols
export interface IServiceRequest {
  setBaseUrl(url: string): void;
  setAccessToken(token: string): void;
  get<T>(path: string, config?: any): Promise<{ data: T }>;
  post<T>(path: string, data?: any, config?: any): Promise<{ data: T }>;
  put<T>(path: string, data?: any, config?: any): Promise<{ data: T }>;
  delete<T>(path: string, config?: any): Promise<{ data: T }>;
  patch<T>(path: string, data?: any, config?: any): Promise<{ data: T }>;
}

// HTTP implementation of IServiceRequest
export class HttpServiceRequest implements IServiceRequest {
  private httpClient: HttpClientService;

  constructor({ baseURL }: { baseURL: string }) {
    this.httpClient = new HttpClientService({
      baseURL,
      timeout: 10000,
      retryAttempts: 3
    });
  }

  setBaseUrl(url: string): void {
    this.httpClient = new HttpClientService({
      baseURL: url,
      timeout: 10000,
      retryAttempts: 3
    });
  }

  setAccessToken(token: string): void {
    this.httpClient = new HttpClientService({
      ...this.httpClient['config'],
      defaultHeaders: {
        ...this.httpClient['config'].defaultHeaders,
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async get<T>(path: string, config?: any): Promise<{ data: T }> {
    const response = await this.httpClient.get<T>(path, config);
    return { data: response.data };
  }

  async post<T>(path: string, data?: any, config?: any): Promise<{ data: T }> {
    const response = await this.httpClient.post<T>(path, data, config);
    return { data: response.data };
  }

  async put<T>(path: string, data?: any, config?: any): Promise<{ data: T }> {
    const response = await this.httpClient.put<T>(path, data, config);
    return { data: response.data };
  }

  async delete<T>(path: string, config?: any): Promise<{ data: T }> {
    const response = await this.httpClient.delete<T>(path, config);
    return { data: response.data };
  }

  async patch<T>(path: string, data?: any, config?: any): Promise<{ data: T }> {
    const response = await this.httpClient.patch<T>(path, data, config);
    return { data: response.data };
  }
}

// Base service controller that can use any communication protocol
export abstract class BaseServiceController {
  protected readonly _serviceRequest: IServiceRequest;
  protected readonly _logger: LoggerService;
  protected readonly _serviceName: string;

  constructor({
    serviceName,
    baseURL,
    serviceRequest,
  }: {
    serviceName: string;
    baseURL?: string;
    serviceRequest?: IServiceRequest;
  }) {
    this._serviceName = serviceName;
    this._logger = new LoggerService(`${serviceName}-controller`);
    
    // Use provided service request or default to HTTP
    this._serviceRequest = serviceRequest || new HttpServiceRequest({ 
      baseURL: baseURL || `http://localhost:3000` 
    });
  }

  public setBaseUrl = (baseUrl: string): void => {
    this._serviceRequest.setBaseUrl(baseUrl);
    this._logger.info(`Base URL updated for ${this._serviceName}`, { baseUrl });
  };

  public setAccessToken = (accessToken: string): void => {
    this._serviceRequest.setAccessToken(accessToken);
    this._logger.debug(`Access token set for ${this._serviceName}`);
  };

  // Health check method that all service controllers should implement
  public checkHealth = async (): Promise<boolean> => {
    try {
      await this._serviceRequest.get('/health');
      return true;
    } catch (error) {
      this._logger.error(`Health check failed for ${this._serviceName}`, error instanceof Error ? error : new Error('Unknown error'));
      return false;
    }
  };
}