import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import {
  HttpConnectionReset,
  HttpForbiddenError,
  HttpNotFound,
  HttpServerError,
  HttpTimeoutError,
  HttpTooManyRequests,
  HttpUnauthorizedError,
} from "../../http-exceptions";

/**
 * Add startTime to request
 * @param config
 */
export const addStartTimeInterceptor = (config: AxiosRequestConfig) => ({
  ...config,
  metadata: { startTime: Date.now() },
});

/**
 * Log into STDOUT in production
 * @param response
 */
export const logInterceptor = (response: AxiosResponse<any, any>) => {
  const endTime = Date.now();
  //@ts-expect-error
  const startTime = response?.config?.metadata?.startTime;

  // biome-ignore lint/suspicious/noConsole: needed for logging
  console.info(
    formatLog({
      url: response?.config?.url || "",
      status: response?.status,
      //@ts-expect-error
      isFromCached: response?.cached,
      time: startTime ? endTime - startTime : undefined,
      method: (response?.config?.method || "").toUpperCase(),
    })
  );

  return response;
};

const getStatus = (response?: AxiosResponse, message?: string) => {
  if (response?.status) {
    return response.status;
  }
  if ((message || "").indexOf("timeout of") > -1) {
    return 408;
  }
  return 500;
};

export const errorInterceptor = (error: AxiosError) => {
  const { config, response, message } = error || {};

  const url = (config?.url || "an unknown url").substring(0, 100);
  const status = getStatus(response, message);
  const statusText = response?.statusText;

  if (status !== 404) {
    const endTime = Date.now();
    //@ts-expect-error
    const startTime = config?.metadata?.startTime;
    // biome-ignore lint/suspicious/noConsole: needed for logging
    console.error(
      formatLog({
        url,
        status,
        isFromCached: false,
        time: startTime ? endTime - startTime : undefined,
        method: error.request?.method || "",
      })
    );
  }

  switch (status) {
    case 429: {
      throw new HttpTooManyRequests(statusText || "Too many requests");
    }
    case 404: {
      throw new HttpNotFound(statusText || "Not Found");
    }
    case 403: {
      throw new HttpForbiddenError("Forbidden");
    }
    case 401: {
      throw new HttpUnauthorizedError("Unauthorized");
    }
    case 504: {
      throw new HttpTimeoutError("Timeout");
    }
    default:
      if ((message || "").indexOf("ECONNRESET") > -1) {
        throw new HttpConnectionReset(
          `ECONNRESET  while querying ${url}. ${statusText || ""} ${
            message || ""
          }`
        );
      }
      throw new HttpServerError(
        `Unknown server error while querying ${url}. ${statusText || ""} ${
          message || ""
        }`
      );
  }
};

export const formatLog = (params: {
  url: string;
  status: number;
  isFromCached?: boolean;
  time?: number;
  method: string;
}) => {
  const { url, status, isFromCached = false, time = -1, method } = params;
  return `status=${status} time=${time} isFromCached=${isFromCached} request=${url} method=${method}`;
};
