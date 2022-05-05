import Axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import constants from '../../constants';
import handleError from './handle-errors';

/**
 * Default axios client - not cached
 * @param config
 * @returns
 */
const httpClient = (config: AxiosRequestConfig): Promise<AxiosResponse> => {
  return Axios({
    timeout: constants.defaultTimeout,
    ...config,
  })
    .then((response) => response)
    .catch((error) => handleError(error));
};

/**
 * GET axios client - not cached
 * @param url
 * @param config
 * @returns
 */
const httpGet = (url: string, config?: AxiosRequestConfig) =>
  httpClient({ ...config, url, method: 'GET' });

export { httpClient, httpGet };

export default httpClient;
