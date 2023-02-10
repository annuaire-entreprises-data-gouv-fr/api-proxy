import Axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import https from 'https';

import constants from '../../constants';
import errorInterceptor from './errors-interceptor';
import logInterceptor from './log-interceptor';

// Keep soket alive
// https://stackoverflow.com/questions/44649566/difference-between-nodejs-new-agent-and-http-keep-alive-header/58332910#58332910
const axios = Axios.create({
  httpsAgent: new https.Agent({ keepAlive: true }),
});

axios.interceptors.response.use(logInterceptor, errorInterceptor);

/**
 * Default axios client
 * @param config
 * @returns
 */
const httpClient = (config: AxiosRequestConfig): Promise<AxiosResponse> => {
  return axios({
    timeout: constants.timeout.S,
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
