import axios, { AxiosInstance } from 'axios';

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
  private httpClient: AxiosInstance;
  private baseURL: string;
  private accessToken?: string;

  constructor({ baseURL }: { baseURL: string }) {
    this.baseURL = baseURL;
    this.httpClient = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  setBaseUrl(url: string): void {
    this.baseURL = url;
    this.httpClient = axios.create({
      baseURL: url,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(this.accessToken ? { 'Authorization': `Bearer ${this.accessToken}` } : {})
      }
    });
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
    this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  async get<T>(path: string, config?: any): Promise<{ data: T }> {
    const response = await this.httpClient.get<T>(path, config);
    return response;
  }

  async post<T>(path: string, data?: any, config?: any): Promise<{ data: T }> {
    const response = await this.httpClient.post<T>(path, data, config);
    return response;
  }

  async put<T>(path: string, data?: any, config?: any): Promise<{ data: T }> {
    const response = await this.httpClient.put<T>(path, data, config);
    return response;
  }

  async delete<T>(path: string, config?: any): Promise<{ data: T }> {
    const response = await this.httpClient.delete<T>(path, config);
    return response;
  }

  async patch<T>(path: string, data?: any, config?: any): Promise<{ data: T }> {
    const response = await this.httpClient.patch<T>(path, data, config);
    return response;
  }
}

// Base service controller that can use any communication protocol
export abstract class BaseServiceController {
  protected readonly _serviceRequest: IServiceRequest;
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
    
    // Use provided service request or default to HTTP
    this._serviceRequest = serviceRequest || new HttpServiceRequest({ 
      baseURL: baseURL || `http://localhost:3000`
    });
  }

  public setBaseUrl = (baseUrl: string): void => {
    this._serviceRequest.setBaseUrl(baseUrl);
    console.log(`Base URL updated for ${this._serviceName}:`, baseUrl);
  };

  public setAccessToken = (accessToken: string): void => {
    this._serviceRequest.setAccessToken(accessToken);
    console.debug(`Access token set for ${this._serviceName}`);
  };

  // Health check method that all service controllers should implement
  public checkHealth = async (): Promise<boolean> => {
    try {
      await this._serviceRequest.get('/health');
      return true;
    } catch (error) {
      console.error(`Health check failed for ${this._serviceName}:`, error);
      return false;
    }
  };
}