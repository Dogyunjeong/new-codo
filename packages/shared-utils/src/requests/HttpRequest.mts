import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import ExpectedServerError from '../error/ExpectedServerError.mts';

export interface ResponseType<T> extends Partial<AxiosResponse<T>> {
  data: T;
}

export interface RequestConfig extends AxiosRequestConfig {
  next?: {
    revalidate?: number;
  };
}

export interface IRequest {
  getBaseUrl: () => string;
  setBaseUrl: (baseUrl: string) => void;
  setAccessToken: (accessToken: string) => void;
  request<T = any>(config: RequestConfig): Promise<ResponseType<T>>;
  get<T = any>(url: string, config?: RequestConfig): Promise<ResponseType<T>>;
  delete<T = any>(url: string, config?: RequestConfig): Promise<ResponseType<T>>;
  head<T = any>(url: string, config?: RequestConfig): Promise<ResponseType<T>>;
  options<T = any>(url: string, config?: RequestConfig): Promise<ResponseType<T>>;
  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseType<T>>;
  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseType<T>>;
  patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseType<T>>;
}

class HttpRequest implements IRequest {
  private _instance: AxiosInstance;
  private _baseURl?: string;
  private _fallbackUrls: string[] = [];
  constructor({ baseURL, timeout }: { baseURL?: string; timeout?: number } = {}) {
    this._instance = axios.create({ baseURL, timeout });
    this._baseURl = baseURL;
  }

  public setAccessToken = (accessToken: string) => {
    this._instance.defaults.headers.Authorization = `Bearer ${accessToken}`;
  };

  private _useFallback = async (fn: (url: string) => Promise<any>, err: Error): Promise<any> => {
    for (const [index, fallBackUrl] of this._fallbackUrls.entries()) {
      try {
        return await fn(fallBackUrl);
      } catch (error) {
        if (index === this._fallbackUrls.length - 1) throw error;
      }
    }
    throw err || new ExpectedServerError('No fallback url found');
  };

  public setBaseUrl = (baseUrl: string) => {
    this._baseURl = baseUrl;
    this._instance.defaults.baseURL = baseUrl;
  };

  public getBaseUrl = () => {
    return this._baseURl || '';
  };

  public request: typeof axios.request = async <T = any, R = AxiosResponse<T>>(
    config: RequestConfig,
  ): Promise<R> => {
    return this._instance.request(config).catch(async (error) => {
      return this._useFallback(async (fallbackUrl) => {
        return this._instance.request({
          ...config,
          url: `${fallbackUrl}${config.url}`,
        });
      }, error);
    });
  };
  public get: typeof axios.get = async <T = any, R = AxiosResponse<T>>(
    url: string,
    config?: RequestConfig,
  ): Promise<R> => {
    return this._instance.get(url, config).catch(async (error) => {
      return this._useFallback(async (fallbackUrl) => {
        return this._instance.get(`${fallbackUrl}${url}`, config);
      }, error);
    });
  };
  public delete: typeof axios.delete = async <T = any, R = AxiosResponse<T>>(
    url: string,
    config?: RequestConfig,
  ): Promise<R> => {
    return this._instance.delete(url, config).catch(async (error) => {
      return this._useFallback(async (fallbackUrl) => {
        return this._instance.delete(`${fallbackUrl}${url}`, config);
      }, error);
    });
  };
  public head: typeof axios.head = async <T = any, R = AxiosResponse<T>>(
    url: string,
    config?: RequestConfig,
  ): Promise<R> => {
    return this._instance.head(url, config).catch(async (error) => {
      return this._useFallback(async (fallbackUrl) => {
        return this._instance.head(`${fallbackUrl}${url}`, config);
      }, error);
    });
  };
  public options: typeof axios.options = async <T = any, R = AxiosResponse<T>>(
    url: string,
    config?: RequestConfig,
  ): Promise<R> => {
    return this._instance.options(url, config).catch(async (error) => {
      return this._useFallback(async (fallbackUrl) => {
        return this._instance.options(`${fallbackUrl}${url}`, config);
      }, error);
    });
  };
  public post: typeof axios.post = async <T = any, R = AxiosResponse<T>>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<R> => {
    return this._instance.post(url, data, config).catch(async (error) => {
      return this._useFallback(async (fallbackUrl) => {
        return this._instance.post(`${fallbackUrl}${url}`, data, config);
      }, error);
    });
  };
  public put: typeof axios.put = async <T = any, R = AxiosResponse<T>>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<R> => {
    return this._instance.put(url, data, config).catch(async (error) => {
      return this._useFallback(async (fallbackUrl) => {
        return this._instance.put(`${fallbackUrl}${url}`, data, config);
      }, error);
    });
  };
  public patch: typeof axios.patch = async <T = any, R = AxiosResponse<T>>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<R> => {
    return this._instance.patch(url, data, config).catch(async (error) => {
      return this._useFallback(async (fallbackUrl) => {
        return this._instance.patch(`${fallbackUrl}${url}`, data, config);
      }, error);
    });
  };
}

export default HttpRequest;
