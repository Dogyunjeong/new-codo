import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { IRequest } from '@base/shared-utils';

class InternalServiceRequest implements IRequest {
  private _instance: AxiosInstance;
  constructor({ serviceId }: { serviceId: string }) {
    this._instance = axios.create();
    this._instance.defaults.headers['X-Codo-internal-service-id'] = serviceId;
  }

  public setBaseUrl = (baseUrl: string) => {
    this._instance.defaults.baseURL = baseUrl;
  };

  public setAccessToken = (accessToken: string) => {
    this._instance.defaults.headers.Authorization = accessToken;
  };

  public setUserAccessToken = (accessToken: string) => {
    this._instance.defaults.headers.Authorization = accessToken;
  };

  private _setServicesAccessToken = () => {
    this._instance.defaults.headers['X-Serverless-Authorization'] = `Bearer`;
  };

  public request: typeof axios.request = async <T = any, R = AxiosResponse<T>>(
    config: AxiosRequestConfig,
  ): Promise<R> => {
    this._setServicesAccessToken();
    return this._instance.request(config);
  };
  public get: typeof axios.get = async <T = any, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<R> => {
    this._setServicesAccessToken();
    return this._instance.get(url, config);
  };
  public delete: typeof axios.delete = async <T = any, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<R> => {
    this._setServicesAccessToken();
    return this._instance.delete(url, config);
  };
  public head: typeof axios.head = async <T = any, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<R> => {
    this._setServicesAccessToken();
    return this._instance.head(url, config);
  };
  public options: typeof axios.options = async <T = any, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<R> => {
    this._setServicesAccessToken();
    return this._instance.options(url, config);
  };
  public post: typeof axios.post = async <T = any, R = AxiosResponse<T>>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<R> => {
    this._setServicesAccessToken();
    return this._instance.post(url, data, config);
  };
  public put: typeof axios.put = async <T = any, R = AxiosResponse<T>>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<R> => {
    this._setServicesAccessToken();
    return this._instance.put(url, data, config);
  };
  public patch: typeof axios.patch = async <T = any, R = AxiosResponse<T>>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<R> => {
    this._setServicesAccessToken();
    return this._instance.patch(url, data, config);
  };
}

export default InternalServiceRequest;
