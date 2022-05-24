import Axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import constants from '../../constants';
import errorInterceptor from './errors-interceptor';
import logInterceptor from './log-interceptor';

const axios = Axios.create();

axios.interceptors.response.use(logInterceptor, errorInterceptor);

/**
 * Default axios client
 * @param config
 * @returns
 */
const httpClient = (config: AxiosRequestConfig): Promise<AxiosResponse> => {
  return axios({
    timeout: constants.defaultTimeout,
    ...config,
  });
};

/**
 * GET axios client
 * @param url
 * @param config
 * @returns
 */
const httpGet = (url: string, config?: AxiosRequestConfig) =>
  httpClient({ ...config, url, method: 'GET' });

export { httpClient, httpGet };

export default httpClient;
