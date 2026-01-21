import http from "node:http";
import https from "node:https";
import Axios from "axios";
import {
  type AxiosCacheInstance,
  buildStorage,
  setupCache,
} from "axios-cache-interceptor";
import constants from "../../constants";
import { CACHE_TIMEOUT, defaultCacheConfig } from "./cache-config";
import {
  addStartTimeInterceptor,
  errorInterceptor,
  logInterceptor,
} from "./interceptors";
import { storage } from "./storage/storage";

/**
 * Limit the number of sockets allocated per distant hosts and to reuse sockets
 */
const agentOptions = {
  keepAlive: true, // Keep sockets around even when there are no outstanding requests, so they can be used for future requests without having to reestablish a TCP connection. Defaults to false
  keepAliveMsecs: 1000, // When using the keepAlive option, specifies the initial delay for TCP Keep-Alive packets. Ignored when the keepAlive option is false or undefined. Defaults to 1000.
  maxSockets: 128, // Maximum number of sockets to allow per host. Defaults to Infinity.
  maxFreeSockets: 128, // Maximum number of sockets to leave open in a free state. Only relevant if keepAlive is set to true. Defaults to 256.
};

export type IDefaultRequestConfig = {
  url?: string;
  timeout?: number;
  useCache?: boolean;
  params?: any;
  headers?: any;
  method?: "POST" | "GET" | "PATCH";
  responseType?: "blob" | "arraybuffer";
  data?: unknown;
  signal?: AbortSignal;
};

export const axiosInstanceFactory = (
  timeout = constants.timeout.L
): AxiosCacheInstance => {
  const axiosOptions = {
    timeout,
    httpsAgent: new https.Agent(agentOptions),
    httpAgent: new http.Agent(agentOptions),
  };

  const axiosInstance = setupCache(Axios.create(axiosOptions), {
    storage: buildStorage(storage),
    // ignore cache-control headers as some API like sirene return 'no-cache' headers
    headerInterpreter: () => CACHE_TIMEOUT,
    // biome-ignore lint/suspicious/noConsole: needed for logging
    debug: console.info,
  });

  //@ts-expect-error
  axiosInstance.interceptors.request.use(addStartTimeInterceptor, (err) =>
    Promise.reject(err)
  );
  axiosInstance.interceptors.response.use(logInterceptor, errorInterceptor);
  return axiosInstance;
};

const axiosInstanceWithCache = axiosInstanceFactory();

/**
 * Default axios client
 * @param config
 * @returns
 */
async function httpClient<T>(config: IDefaultRequestConfig): Promise<T> {
  const response = await axiosInstanceWithCache({
    timeout: constants.timeout.S,
    cache: config.useCache ? defaultCacheConfig : false,
    ...config,
  });
  return response.data;
}

/**
 * GET axios client
 * @param url
 * @param config
 * @returns
 */
async function httpGet<T>(
  url: string,
  config?: IDefaultRequestConfig
): Promise<T> {
  return await httpClient({ ...config, url, method: "GET" });
}

export { httpClient, httpGet };

export default httpClient;
