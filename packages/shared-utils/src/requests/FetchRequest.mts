import { ExpectedServerError, type IRequest } from '@base/shared-utils';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import qs from 'query-string';

class FetchRequest implements IRequest {
  private _baseUrl?: string;
  private _accessToken?: string;
  private _fallbackUrls: string[] = [];
  private _defaultConfig: any;
  constructor({ baseUrl, defaultConfig }: { baseUrl?: string; defaultConfig?: any } = {}) {
    this._baseUrl = baseUrl;
    this._defaultConfig = defaultConfig;
  }

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

  private _makeRequest = async <T extends any>(url: string, config?: any): Promise<{ data: T }> => {
    let path = url;
    if (url.startsWith('/')) {
      path = url.slice(1);
    }

    const response = await fetch(
      `${this._baseUrl}/${path}?` + qs.stringify(config?.params || {}, { arrayFormat: 'bracket' }),
      {
        ...this._defaultConfig,
        ...config,
      },
    );
    const data = await response.json();
    return { data };
  };

  public setBaseUrl = (baseUrl: string) => {
    this._baseUrl = baseUrl;
  };

  public setAccessToken = (accessToken: string) => {
    this._accessToken = accessToken;
  };

  public request = async <T = any, R = AxiosResponse<T>>(
    config: AxiosRequestConfig & { url: string },
  ): Promise<R> => {
    return this._makeRequest(config.url, config).catch(async (error) => {
      return this._useFallback(async (fallbackUrl) => {
        return this._makeRequest(`${fallbackUrl}${config.url}`, config);
      }, error);
    });
  };
  public get = async <T = any, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<R> => {
    return this._makeRequest(url, { ...config, method: 'GET' }).catch(async (error) => {
      return this._useFallback(async (fallbackUrl) => {
        return this._makeRequest(`${fallbackUrl}${url}`, {
          ...config,
          method: 'GET',
        });
      }, error);
    });
  };
  public delete = async <T = any, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<R> => {
    return this._makeRequest(url, { ...config, method: 'DELETE' }).catch(async (error) => {
      return this._useFallback(async (fallbackUrl) => {
        return this._makeRequest(`${fallbackUrl}${url}`, {
          ...config,
          method: 'DELETE',
        });
      }, error);
    });
  };
  public head = async <T = any, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<R> => {
    return this._makeRequest(url, { ...config, method: 'HEAD' }).catch(async (error) => {
      return this._useFallback(async (fallbackUrl) => {
        return this._makeRequest(`${fallbackUrl}${url}`, {
          ...config,
          method: 'HEAD',
        });
      }, error);
    });
  };
  public options = async <T = any, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<R> => {
    return this._makeRequest(url, { ...config, method: 'OPTIONS' }).catch(async (error) => {
      return this._useFallback(async (fallbackUrl) => {
        return this._makeRequest(`${fallbackUrl}${url}`, {
          ...config,
          method: 'OPTIONS',
        });
      }, error);
    });
  };
  public post = async <T = any, R = AxiosResponse<T>>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<R> => {
    return this._makeRequest(url, { ...config, data, method: 'POST' }).catch(async (error) => {
      return this._useFallback(async (fallbackUrl) => {
        return this._makeRequest(`${fallbackUrl}${url}`, {
          ...config,
          data,
          method: 'POST',
        });
      }, error);
    });
  };
  public put = async <T = any, R = AxiosResponse<T>>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<R> => {
    return this._makeRequest(url, { ...config, data, method: 'PUT' }).catch(async (error) => {
      return this._useFallback(async (fallbackUrl) => {
        return this._makeRequest(`${fallbackUrl}${url}`, {
          ...config,
          data,
          method: 'PUT',
        });
      }, error);
    });
  };
  public patch = async <T = any, R = AxiosResponse<T>>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<R> => {
    return this._makeRequest(url, { ...config, data, method: 'PATCH' }).catch(async (error) => {
      return this._useFallback(async (fallbackUrl) => {
        return this._makeRequest(`${fallbackUrl}${url}`, {
          ...config,
          data,
          method: 'PATCH',
        });
      }, error);
    });
  };
}

export default FetchRequest;
