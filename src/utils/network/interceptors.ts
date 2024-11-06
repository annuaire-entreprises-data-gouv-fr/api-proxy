import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  HttpConnectionReset,
  HttpForbiddenError,
  HttpNotFound,
  HttpServerError,
  HttpTimeoutError,
  HttpTooManyRequests,
  HttpUnauthorizedError,
} from '../../http-exceptions';

/**
 * Add startTime to request
 * @param config
 */
export const addStartTimeInterceptor = (config: AxiosRequestConfig) => {
  return {
    ...config,
    metadata: { startTime: new Date().getTime() },
  };
};

/**
 * Log into STDOUT in production
 * @param response
 */
export const logInterceptor = (response: AxiosResponse<any, any>) => {
  const endTime = new Date().getTime();
  //@ts-ignore
  const startTime = response?.config?.metadata?.startTime;

  console.info(
    formatLog(
      response?.config?.url || '',
      response?.status,
      //@ts-ignore
      response?.cached,
      startTime ? endTime - startTime : undefined,
      (response?.config?.method || '').toUpperCase(),
      response?.request?.socket?.localAddress
    )
  );

  return response;
};

const getStatus = (response?: AxiosResponse, message?: string) => {
  if (response?.status) {
    return response.status;
  }
  if ((message || '').indexOf('timeout of') > -1) {
    return 408;
  }
  return 500;
};

export const errorInterceptor = (error: AxiosError) => {
  const { config, response, message } = error || {};

  const url = (config?.url || 'an unknown url').substring(0, 100);
  const status = getStatus(response, message);
  const statusText = response?.statusText;

  if (status !== 404) {
    const endTime = new Date().getTime();
    //@ts-ignore
    const startTime = config?.metadata?.startTime;
    console.error(
      formatLog(
        url,
        status,
        false,
        startTime ? endTime - startTime : undefined,
        error.request?.method,
        error?.request?.socket?.localAddress
      )
    );
  }

  switch (status) {
    case 429: {
      throw new HttpTooManyRequests(statusText || 'Too many requests');
    }
    case 404: {
      throw new HttpNotFound(statusText || 'Not Found');
    }
    case 403: {
      throw new HttpForbiddenError('Forbidden');
    }
    case 401: {
      throw new HttpUnauthorizedError('Unauthorized');
    }
    case 504: {
      throw new HttpTimeoutError('Timeout');
    }
    default:
      if ((message || '').indexOf('ECONNRESET') > -1) {
        throw new HttpConnectionReset(
          `ECONNRESET  while querying ${url}. ${statusText || ''} ${
            message || ''
          }`
        );
      }
      throw new HttpServerError(
        `Unknown server error while querying ${url}. ${statusText || ''} ${
          message || ''
        }`
      );
  }
};

export const formatLog = (
  url: string,
  status: number,
  isFromCached = false,
  time = -1,
  method: string,
  outgoingIp: string
) => {
  return `status=${status} time=${time} isFromCached=${isFromCached} request=${url} method=${method} out_ip=${outgoingIp}`;
};
