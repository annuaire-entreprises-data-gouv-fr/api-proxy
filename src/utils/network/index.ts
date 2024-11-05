import Axios from 'axios';
import https from 'https';
import http from 'http';

import constants from '../../constants';
import { CACHE_TIMEOUT, defaultCacheConfig } from './cache-config';
import { RedisStorage } from './storage/redis-storage';
import {
  AxiosCacheInstance,
  buildStorage,
  setupCache,
} from 'axios-cache-interceptor';
import {
  addStartTimeInterceptor,
  errorInterceptor,
  logInterceptor,
} from './interceptors';

const redisStorage = RedisStorage.isRedisEnabled
  ? new RedisStorage(CACHE_TIMEOUT)
  : undefined;

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
  method?: 'POST' | 'GET' | 'PATCH';
  responseType?: 'blob' | 'arraybuffer';
  data?: unknown;
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
    storage: redisStorage ? buildStorage(redisStorage) : undefined,
    // ignore cache-control headers as some API like sirene return 'no-cache' headers
    headerInterpreter: () => CACHE_TIMEOUT,
    // eslint-disable-next-line no-console
    debug: console.info,
  });

  //@ts-ignore
  axiosInstance.interceptors.request.use(addStartTimeInterceptor, (err) =>
    Promise.reject(err)
  );
  //@ts-ignore
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
  return await httpClient({ ...config, url, method: 'GET' });
}

export { httpClient, httpGet };

export default httpClient;
